module.exports = (function() {
    "use strict";
    const toolio = app.toolio;
    const event_bus = app.event_bus;
    const DEFAULT_CHUNK_SIZE = 1024 * 1024;
    let chunk_size = DEFAULT_CHUNK_SIZE;

    if (localStorage.chunk_size) {
        let user_chunk_size = Number(localStorage.chunk_size);

        if (!isNaN(user_chunk_size) && user_chunk_size > 0) {
            chunk_size = user_chunk_size;
        }
    }

    let wupsocket = {
        binary_transfers: {}
    };

    let ws_connected = false;
    let binary_connected = false;
    let manually_closed = false;
    let key;

    let prime_socket = new Worker('js/public/prime_socket.js');
    prime_socket.postMessage({});

    let ws_handlers = {
        connection: function(message) {
            switch (message.sub_type) {
                case 'heartbeat':
                    wupsocket.send('connection', 'heartbeat', message.data);
                    break;
                case 'connection_info':
                    wupsocket.connection_info = message.data;
                    event_bus.emit('ws.connect');

                    // Thinking here is that if the client sends a message on a regular interval, it'll trigger a disconnect faster.
                    clearInterval(wupsocket.pong);
                    wupsocket.pong = setInterval(function() {
                        wupsocket.send('connection', 'pong', {});
                    }, 7500);

                    // Hook up the Prime Socket.
                    prime_socket.postMessage({
                        action: 'binary_connect',
                        params: {
                            server_ip: app.settings.binary_server,
                            connection_info: wupsocket.connection_info
                        }
                    });

                    break;
                default:
                    break;
            }
        }

    };

    prime_socket.addEventListener('message', function(e) {
        let params = e.data.params;

        switch (e.data.action) {
            case 'connect':
                wupsocket.reconnecting = false;
                wupsocket.last_reconnect_attempt = 0;
                ws_connected = true;
                break;

            case 'binary_connect':
                binary_connected = true;
                event_bus.emit('ws.binary_connect');
                break;

            case 'binary_disconnect':
                binary_connected = false;
                event_bus.emit('ws.binary_disconnect');
                break;

            case 'binary_reconnect_attempt':
                app.append_system("Attempting to reconnect binary...", {color: 'green'});
                break;

            case 'disconnect':
                if (manually_closed === false) {
                    event_bus.emit('ws.disconnect');
                }

                ws_connected = false;
                break;

            case 'message':
                let message = params.message;
                if (typeof(ws_handlers[message.type]) == "function") {
                    ws_handlers[message.type](message);
                }

                if (message.type != null && message.sub_type != null && message.data != null) {
                    event_bus.emit(message.type + '.' + message.sub_type, message.data);
                }

                if (wupsocket.popups[message.type] != null) {
                    wupsocket.popups[message.type].forEach(function(p) {
                        if (p.room_id == message.data.room_id) {
                            let popup_message = $.extend(message, {listener_name: 'ws.' + message.type});
                            p.popup.postMessage(popup_message, app.domain);
                        }
                    });
                }

                break;

            case 'message_buffer':
                let meta = params.meta;

                if (meta.type == 'blackboard') {
                    let inflated_response = pako.inflate(params.buffer, {to: 'string'});
                    let response_as_json = JSON.parse(inflated_response);
                    let useful_response = {
                        bg_color: meta.bg_color,
                        room_id: meta.room_id,
                        commands: response_as_json
                    };

                    event_bus.emit('black_board.load', useful_response);
                    return;
                }

                // I'm sure it's fine.
                if (meta.debut === true && wupsocket.binary_transfers[meta.transfer_id] == null) {
                    wupsocket.binary_transfers[meta.transfer_id] = {data: []};
                }
                else if (wupsocket.binary_transfers[meta.transfer_id] == null) {
                    console.debug("Ignoring partial transfer " + meta.transfer_id);
                    return;
                }

                if (meta.no_data !== true) {
                    wupsocket.binary_transfers[meta.transfer_id].data.push(params.buffer);
                }
                else {
                    if (wupsocket.binary_transfers[meta.transfer_id].chunk == null) {
                        wupsocket.binary_transfers[meta.transfer_id].chunk = 0;
                    }
                    else {
                        wupsocket.binary_transfers[meta.transfer_id].chunk++;
                    }
                }

                if (meta.complete == true) {
                    meta.file_info.username = meta.username;
                    app.handle_binary(wupsocket.binary_transfers[meta.transfer_id].data, meta.file_info);
                    delete wupsocket.binary_transfers[meta.transfer_id];
                    event_bus.emit('ws.transfer_complete', {transfer_id: meta.transfer_id});
                }
                else {
                    let stored_size;

                    if (meta.no_data == true) {
                        let cur_chunk = wupsocket.binary_transfers[meta.transfer_id] && wupsocket.binary_transfers[meta.transfer_id].chunk;
                        cur_chunk = cur_chunk || 0;
                        stored_size = cur_chunk * chunk_size;
                    }
                    else {
                        stored_size = wupsocket.binary_transfers[meta.transfer_id].data.reduce(function(prev, chunk) {
                            return prev + chunk.byteLength;
                        }, 0);
                    }

                    event_bus.emit('ws.transfer_update', {transfer_id: meta.transfer_id, stored_size: stored_size});
                }

                break;

            case 'error':
                event_bus.emit('ws.error');
                break;

            default:
                break;
        }
    });


    wupsocket.send_binary = function(blob, meta) {
        if (!binary_connected) {
            app.append_system('Unable to send: Binary not connected.', {color: 'red'});
        }
        let transfer_id = meta.transfer_id;

        prime_socket.postMessage({
            action: 'create_transfer_progress',
            params: {
                meta: meta
            }
        });

        let send_chunk = function(buffer, meta, start) {
            let transfer_info = {
                complete: false,
                transfer_id: transfer_id,
                room_id: meta.room_id
            };

            if (start === 0) {
                transfer_info.debut = true;
            }

            if (start + chunk_size >= buffer.byteLength) {
                transfer_info.complete = true;
                transfer_info.file_info = meta;

                let chunk = buffer.slice(start);
                prime_socket.postMessage({
                    action: 'send_binary',
                    params: {
                        blob: chunk,
                        meta: transfer_info
                    }
                }, [chunk]);
            }
            else {
                let chunk = buffer.slice(start, start + chunk_size);
                prime_socket.postMessage({
                    action: 'send_binary',
                    params: {
                        blob: chunk,
                        meta: transfer_info
                    }
                }, [chunk]);

                setTimeout(function() {
                    send_chunk(buffer, meta, start + chunk_size);
                }, 0);
            }
        };

        wupsocket.binary_transfers[transfer_id] = {data: [blob]};
        send_chunk(blob, meta, 0);
    };

    wupsocket.send = function(type, sub_type, data) {
        if (ws_connected === false) {
            console.error("Wupsocket is not connected");
            event_bus.emit('ws.error');
            return;
        }

        let wrapped_message = {
            type: type,
            sub_type: sub_type,
            data: data
        };

        prime_socket.postMessage({
            action: 'send',
            params: {
                message: wrapped_message
            }
        });
    };

    wupsocket.is_connected = function() {
        return ws_connected;
    };

    wupsocket.close = function() {
        manually_closed = true;
        prime_socket.postMessage({action: 'disconnect'});
    };

    app.register_window_listener('ws.send', function(data) {
        wupsocket.send(data.type, data.sub_type, data.message);
    });

    wupsocket.popups = {};
    wupsocket.register_popup = function(page_key, room_id, popup) {
        if (!Array.isArray(wupsocket.popups[page_key])) {
            wupsocket.popups[page_key] = [];
        }

        wupsocket.popups[page_key].push({room_id: room_id, popup: popup, page_key: page_key});
        app.popups.push(popup);
    };

    wupsocket.reconnect = function() {
        wupsocket.reconnecting = true;

        if (Date.now() - wupsocket.last_reconnect_attempt >= 5000) {
            wupsocket.last_reconnect_attempt = Date.now();

            prime_socket.postMessage({
                action: 'connect',
                params: {
                    server_ip: app.settings.server
                }
            });
        }
        else {
            let diff = 5000 - (Date.now() - wupsocket.last_reconnect_attempt);
            setTimeout(function() {
                wupsocket.reconnect();
            }, diff)
        }

    };

    wupsocket.connect = function() {
        prime_socket.postMessage({action: 'disconnect'});

        prime_socket.postMessage({
            action: 'connect',
            params: {
                server_ip: app.settings.server
            }
        });
    };

    return wupsocket;
})();
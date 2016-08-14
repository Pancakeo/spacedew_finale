module.exports = (function() {
    "use strict";
    var toolio = require('./toolio');
    var event_bus = require('../../../shared/event_bus');

    var CHUNK_SIZE = 1024 * 128; // xx kb.

    var wupsocket = {
        binary_transfers: {}
    };

    var connected = false;
    var manually_closed = false;
    var key;

    var prime_socket = new Worker('js/public/prime_socket.js');
    prime_socket.postMessage({});

    var ws_handlers = {
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

                    break;
                default:
                    break;
            }
        }

    };

    prime_socket.addEventListener('message', function(e) {
        var params = e.data.params;

        switch (e.data.action) {
            case 'connect':
                wupsocket.reconnecting = false;
                wupsocket.last_reconnect_attempt = 0;
                connected = true;
                break;

            case 'disconnect':
                if (manually_closed === false) {
                    event_bus.emit('ws.disconnect');
                }

                connected = false;
                break;

            case 'message':
                var message = params.message;
                if (typeof(ws_handlers[message.type]) == "function") {
                    ws_handlers[message.type](message);
                }
                else {
                    if (message.type != null && message.sub_type != null && message.data != null) {
                        event_bus.emit(message.type + '.' + message.sub_type, message.data);
                    }
                }

                break;

            case 'message_buffer':
                var meta = params.meta;

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
                    if (meta.no_data == true) {
                        var cur_chunk = wupsocket.binary_transfers[meta.transfer_id] && wupsocket.binary_transfers[meta.transfer_id].chunk;
                        cur_chunk = cur_chunk || 0;
                        stored_size = cur_chunk * CHUNK_SIZE;
                    }
                    else {
                        var stored_size = wupsocket.binary_transfers[meta.transfer_id].data.reduce(function(prev, chunk) {
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
        var transfer_id = meta.transfer_id;

        var send_chunk = function(buffer, meta, start) {
            var transfer_info = {
                complete: false,
                transfer_id: transfer_id,
                room_id: meta.room_id
            };

            if (start === 0) {
                transfer_info.debut = true;
            }

            if (start + CHUNK_SIZE >= buffer.byteLength) {
                transfer_info.complete = true;
                transfer_info.file_info = meta;

                var chunk = buffer.slice(start);
                prime_socket.postMessage({
                    action: 'send_binary',
                    params: {
                        blob: chunk,
                        meta: transfer_info
                    }
                }, [chunk]);
            }
            else {
                var chunk = buffer.slice(start, start + CHUNK_SIZE);
                prime_socket.postMessage({
                    action: 'send_binary',
                    params: {
                        blob: chunk,
                        meta: transfer_info
                    }
                }, [chunk]);

                setTimeout(function() {
                    send_chunk(buffer, meta, start + CHUNK_SIZE);
                }, 0);
            }
        };

        wupsocket.binary_transfers[transfer_id] = {data: [blob]};
        send_chunk(blob, meta, 0);
    };

    wupsocket.send = function(type, sub_type, data) {
        if (connected === false) {
            console.error("Wupsocket is not connected");
            event_bus.emit('ws.error');
            return;
        }

        var wrapped_message = {
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
        return connected;
    };

    wupsocket.close = function() {
        manually_closed = true;
        prime_socket.postMessage({action: 'disconnect'});
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
            var diff = 5000 - (Date.now() - wupsocket.last_reconnect_attempt);
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
module.exports = (function() {
    "use strict";
    var toolio = require('./toolio');
    var event_bus = require('../../../shared/event_bus');

    var wupsocket = {
        reconnect_attempt: 0,
        MAX_RECONNECT_ATTEMPTS: 10
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
                // I'm sure it's fine.
                if (app.ready) {
                    app.handle_binary(params.buffer, params.meta);
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

        prime_socket.postMessage({
            action: 'send_binary',
            params: {
                blob: blob,
                meta: meta
            }
        }, [blob]);
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

    wupsocket.connect = function() {
        prime_socket.postMessage({action: 'disconnect'});
        wupsocket.reconnect_attempt++;

        prime_socket.postMessage({
            action: 'connect',
            params: {
                server_ip: app.settings.server
            }
        });
    };

    return wupsocket;
})();
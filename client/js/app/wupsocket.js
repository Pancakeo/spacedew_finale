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

    var death_socket = new Worker('js/public/chat_socket.js');
    death_socket.postMessage({});

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

    death_socket.addEventListener('message', function(e) {
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
                // console.log(message);
                if (typeof(ws_handlers[message.type]) == "function") {
                    ws_handlers[message.type](message);
                }
                else {
                    if (message.type != null && message.sub_type != null && message.data != null) {
                        event_bus.emit(message.type + '.' + message.sub_type, message.data);
                    }
                }

                break;

            case 'error':
                event_bus.emit('ws.error');
                break;

            default:
                break;
        }
    });


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

        death_socket.postMessage({
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
        death_socket.postMessage({action: 'disconnect'});
    };

    wupsocket.connect = function() {
        death_socket.postMessage({action: 'disconnect'});
        wupsocket.reconnect_attempt++;

        death_socket.postMessage({
            action: 'connect',
            params: {
                server_ip: spacedew_fin.settings.server
            }
        });
    };

    return wupsocket;
})();
var ws;
var binary_ws;
var BUFFER_QUEUE_THRESHOLD = 1024 * 256;

var binary_life = null;
var binary_meta = {};

var util = {};
util.array_buffer_to_string = function(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
};

util.string_to_array_buffer = function(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var buf_view = new DataView(buf);

    for (var i = 0; i < str.length; i++) {
        buf_view.setUint16(i * 2, str.charCodeAt(i), true);
    }

    return buf;
};

util.blob_from_buffer = function(buffer, meta) {
    var header = util.string_to_array_buffer(JSON.stringify(meta));

    var header_length = new ArrayBuffer(4);    // 4 bytes = 32-bits.
    new DataView(header_length).setUint32(0, header.byteLength, true); // explicit little endian

    return new Blob([header_length, header, buffer]); // roll it up
};

addEventListener('message', function(e) {
    var params = e.data.params;

    var send_if_connected = function(ws_thing, message) {
        var closing_states = [2, 3];

        if (!ws_thing) {
            return;
        }

        if (ws_thing.readyState == 1) {
            ws_thing.send(message);
        }
        else {
            if (closing_states.indexOf(ws_thing.readyState) >= 0) {
                ws_thing.close();
            }
        }
    };

    var connect_binary = function() {
        binary_ws = new WebSocket(binary_meta.server_ip);
        binary_ws.binaryType = "arraybuffer";

        binary_ws.onopen = function(event) {
            var message = {
                type: 'link_binary',
                connection_id: binary_meta.connection_info.connection_id
            };

            postMessage({action: 'binary_connect'});
            send_if_connected(binary_ws, JSON.stringify(message));

            // Heh heh
            clearInterval(binary_life);
            binary_life = setInterval(function() {
                var message = {
                    type: 'heartbeat',
                    timestamp: Date.now()
                };

                if ((binary_ws && binary_ws.readyState > 1) && (ws && ws.readyState == 1)) {
                    postMessage({action: 'binary_reconnect_attempt'});
                    connect_binary();
                }

                send_if_connected(binary_ws, JSON.stringify(message));
            }, 7500);
        };

        binary_ws.onerror = function(event) {
            postMessage({action: 'binary_error'});
        };

        binary_ws.onclose = function(event) {
            postMessage({action: 'binary_disconnect'});
        };

        binary_ws.onmessage = function(event) {
            if (event.data instanceof ArrayBuffer) {
                var dv = new DataView(event.data, 0, 4);
                var header_length = dv.getUint32(0, true);

                var meta_string = util.array_buffer_to_string(event.data.slice(4, 4 + header_length));
                var meta = JSON.parse(meta_string);

                var buffer = event.data.slice(4 + header_length);

                postMessage({
                    action: 'message_buffer',
                    params: {
                        meta: meta,
                        buffer: buffer
                    }
                }, [buffer]);
            }
        };
    };

    switch (e.data.action) {

        case 'send_binary':
            var blob = util.blob_from_buffer(params.blob, params.meta);
            send_if_connected(binary_ws, blob);
            break;

        case 'create_transfer_progress':
            if (binary_ws && binary_ws.readyState == 1) {
                var wrapped_message = {
                    type: 'chatterbox',
                    sub_type: 'create_transfer_progress',
                    data: params.meta
                };

                send_if_connected(ws, JSON.stringify(wrapped_message));
            }
            break;

        case 'binary_connect':
            binary_meta = params;
            connect_binary();
            break;

        case 'connect':
            ws = new WebSocket(params.server_ip);

            ws.onopen = function(event) {
                postMessage({action: 'connect'});
            };

            ws.onerror = function(event) {
                postMessage({action: 'error'});
            };

            ws.onclose = function(event) {
                postMessage({action: 'disconnect'});
            };

            ws.onmessage = function(event) {
                var parsed_message = JSON.parse(event.data);
                postMessage({
                    action: 'message',
                    params: {
                        message: parsed_message
                    }
                });
            };
            break;

        case 'disconnect':
            ws && ws.close();
            binary_ws && binary_ws.close();
            break;

        case 'send':
            send_if_connected(ws, JSON.stringify(params.message));
            break;

        default:
            break;
    }
});
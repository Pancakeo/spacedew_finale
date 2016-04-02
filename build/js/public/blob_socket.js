var ws;
var blob_socket = {};
var toolio = {};

toolio.array_buffer_to_string = function(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
};

toolio.string_to_array_buffer = function(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var buf_view = new DataView(buf);

    for (var i = 0; i < str.length; i++) {
        buf_view.setUint16(i * 2, str.charCodeAt(i), true);
    }

    return buf;
};

toolio.blob_from_buffer = function(buffer, meta) {
    var header = toolio.string_to_array_buffer(JSON.stringify(meta));

    var header_length = new ArrayBuffer(4);    // 4 bytes = 32-bits.
    new DataView(header_length).setUint32(0, header.byteLength, true); // explicit little endian

    return new Blob([header_length, header, buffer]); // roll it up
};

addEventListener('message', function(e) {
    var params = e.data.params;

    switch (e.data.action) {

        case 'send':
            var blob = toolio.blob_from_buffer(params.chunk, params.transfer_info);
            ws.send(blob);
            break;

        case 'disconnect':
            if (ws != null) {
                ws.close();
            }

            break;

        case 'connect':
            ws = new WebSocket(params.server_ip);
            ws.binaryType = "arraybuffer";

            ws.onerror = function(event) {
                console.log("error", event);
            };

            ws.onclose = function(event) {
                console.log("close", event);
                postMessage({action: 'disconnect'});
            };

            ws.onopen = function() {
                var wrapped_info = {
                    type: 'attach_connection',
                    info: params.info
                };

                ws.send(JSON.stringify(wrapped_info));
            };

            ws.onmessage = function(event) {
                var dv = new DataView(event.data, 0, 4);
                var header_length = dv.getUint32(0, true);

                var meta_string = toolio.array_buffer_to_string(event.data.slice(4, 4 + header_length));
                var meta = JSON.parse(meta_string);

                if (meta.transfer_id == null) {

                    switch (meta.type) {
                        case 'heartbeat':
                            ws.send(JSON.stringify(meta));
                            break;

                        default:
                            break;
                    }

                    return;
                }

                // Server echoes the 'complete' packet to the sender.
                if (meta.no_data !== true) {
                    var chunk = event.data.slice(4 + header_length);

                    postMessage({
                        action: 'message',
                        params: {
                            meta: meta,
                            chunk: chunk
                        }
                    }, [chunk]);
                }
                else {
                    postMessage({
                        action: 'message',
                        params: {
                            meta: meta
                        }
                    });
                }

            };


            break;

        default:
            break;
    }

});
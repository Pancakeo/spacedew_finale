var ws;
var death_socket = {};

addEventListener('message', function(e) {
    var params = e.data.params;

    switch (e.data.action) {

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
            if (ws != null) {
                ws.close();
            }
            break;

        case 'send':
            ws.send(JSON.stringify(params.message));
            break;

        default:
            break;
    }

});

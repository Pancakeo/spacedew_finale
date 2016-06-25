"use strict";
var server_settings = require('./managers/server_settings');

global.shared_root = require('path').join(__dirname, '..', 'shared');
global.Promise = require("bluebird");

server_settings.load().then(function(settings) {
    var WebSocketServer = require('ws').Server;
    var chat_port = settings.chat_port;
    var uuid = require('node-uuid');

    require('./servers/http_server');
    var sessionator = require('./managers/sessionator');

    console.log("Listening for WebSocket requests (chat) on port " + chat_port);
    var wss = new WebSocketServer({port: chat_port});

    var message_router = require('./managers/message_router');

    wss.on('connection', function(ws) {
        var connection_id = uuid.v4();
        var session = sessionator.connect(connection_id, ws);

        ws.on('message', function(message) {
            message_router.handle(session, message);
        });

        ws.on('close', function(message) {
            sessionator.disconnect(connection_id);
        });

    });
}).catch(function(error) {
    // The downfall of Promises.
    console.error('Fatal error', error);
    process.exit(1);
});

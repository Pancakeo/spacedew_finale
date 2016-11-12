"use strict";

var WebSocketServer = require('ws').Server;
var binary_port = app.config.binary_port;
var uuid = require('node-uuid');

var sessionator = require('../managers/sessionator');

console.log("Listening for WebSocket requests (binary) on port " + binary_port);
var wss = new WebSocketServer({port: binary_port});

var message_router = require('../managers/message_router');

wss.on('connection', function(binary_ws) {
    var session = null;

    clearInterval(binary_ws.heartbeat_interval);
    binary_ws.heartbeat_interval = setInterval(function() {
        var heartbeat_message = {
            type: 'heartbeat',
            timestamp: Date.now()
        };

        try {
            binary_ws.send(JSON.stringify(heartbeat_message));
        }
        catch (e) {
            clearInterval(binary_ws.heartbeat_interval);
            // console.log("Failed to send heartbeat.");
            binary_ws.close();
        }

    }, 7500);

    binary_ws.on('message', function(message) {
        if (message instanceof Buffer) {
            if (session) {
                message_router.handle(session, message);
            }
        }
        else {
            var parsed_message = JSON.parse(message);
            if (parsed_message.type == 'link_binary') {
                session = sessionator.link_binary(parsed_message.connection_id, binary_ws);
            }
        }
    });

    binary_ws.on('close', function(message) {
        if (session) {
            // console.log("Uh oh, disconnected from " + session.connection_id);
        }

    });

});
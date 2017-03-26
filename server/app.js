"use strict";
global.Promise = require("bluebird");

require("console-stamp")(console, {
    colors: {
        stamp: "yellow",
        label: "white",
        metadata: "green"
    }
});

global.app = {};
app.shared_root = require('path').join(__dirname, '..', 'shared');
app.config = require('./conf/configuration').load();
global.event_bus = require(app.shared_root + '/event_bus');

var WebSocketServer = require('ws').Server;
var chat_port = app.config.chat_port;
var uuid = require('node-uuid');

require('./servers/http_server');
require('./servers/binary_server');
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

var star_wars = require('./stars/wupfindstar');
setInterval(function() {
    star_wars.update_all();
}, 60000 * 60); // 1 hour.

star_wars.update_all();
"use strict";

var handlers = {};
var normalized_path = require("path").join(__dirname, '../message_handlers');
var sessionator = require('../managers/sessionator');

require("fs").readdirSync(normalized_path).forEach(function(file) {
    var handler = require('../message_handlers/' + file);
    var key = require('path').basename(file, '.js');
    handler.key = key;

    if (handlers[key] != null) {
        throw 'message handler for ' + key + ' is already defined. Duplicate file?';
    }

    handlers[key] = handler;
});

exports.handle = function(session, mixed_message) {
    session.last_activity = Date.now();

    if (mixed_message instanceof Buffer) {
        handlers.binary_dumptruck.handle_buffer(session, mixed_message);
        return;
    }

    try {
        var parsed_message = JSON.parse(mixed_message);
        var type = parsed_message.type;
    }
    catch (e) {
        console.log("Failed to parse", mixed_message);
        return;
    }

    if (typeof(handlers[type]) == "object") {
        var handler = handlers[type];

        if (handler.requires_auth !== false) {
            if (session.authenticated) {
                handler.handle_message(session, parsed_message);
            }
        }
        else {
            handler.handle_message(session, parsed_message);
        }
    }
    else {
        console.error("No parser available for", type, parsed_message);
    }
};

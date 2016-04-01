"use strict";

var handlers = {};
var normalized_path = require("path").join(__dirname, '../message_handlers');

require("fs").readdirSync(normalized_path).forEach(function(file) {
    var handler = require('../message_handlers/' + file);
    var key = require('path').basename(file, '.js');
    handler.key = key;

    if (handlers[key] != null) {
        throw 'message handler for ' + key + ' is already defined. Duplicate file?';
    }

    handlers[key] = handler.handle_message;
});

exports.handle = function(session, json_message) {
    var parsed_message = JSON.parse(json_message);
    var type = parsed_message.type;

    if (typeof(handlers[type]) == "function") {
        var handler = handlers[type];

        if (handler.requires_auth === true) {
            if (session.authenticated) {
                handler(session, parsed_message);
            }
        }
        else {
            handler(session, parsed_message);
        }

    }
    else {
        console.error("No parser available for", type, parsed_message);
    }
};
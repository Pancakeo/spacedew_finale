"use strict";

var sessionator = require('../managers/sessionator');
exports.requires_auth = true;

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var send_message = function(sub_type, message) {
        session.send(exports.key, sub_type, message);
    };

    var heh = {};
    heh.wup_find_chat = function() {
        // Send various things.
        session.login();
        send_message('system', {message: "Welcome to the Everlasting Kog'maw"});
    };

    heh.chat = function() {
        var username = session.profile.username;
        sessionator.broadcast('chatterbox', 'chat', {message: data.message, username: username});
    };

    if (heh[sub_type] != null) {
        heh[sub_type]();
    }
};
"use strict";
var sessionator = require('../managers/sessionator');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    
    var handle = {
        chat: function() {
            sessionator.broadcast('chatterbox', 'chat', {message: data.message, username: session.profile.username});
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
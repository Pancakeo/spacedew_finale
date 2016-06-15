"use strict";
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var server_settings = require('../managers/server_settings');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    var room = wiseau.get_room(data.room_id);

    if (room == null) {
        return;
    }

    var handle = {
        chat: function() {
            var clean_message = data.message;
            clean_message = clean_message.replace(/</g, '&lt;');
            clean_message = clean_message.replace(/>/g, '&gt;');

            if (clean_message.length > 0) {
                var recent_message = session.profile.username + ': ' + clean_message;
                room.add_recent_message(recent_message);

                sessionator.broadcast('chatterbox', 'chat', {message: clean_message, username: session.profile.username}, {room_id: room.id});
            }
        },
        blargh: function() {
            if (data.message.length > 0) {
                sessionator.broadcast('chatterbox', 'blargh', {message: data.message, username: session.profile.username}, {room_id: room.id});
            }
        },
        change_room_name: function() {
            if (room == null) {
                return;
            }

            room.name = data.name;
            sessionator.broadcast('chatterbox', 'change_room_name', {new_name: room.name, blame: session.profile.username}, {room_id: room.id});
            server_settings.set('lobby_room_name', data.name);
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
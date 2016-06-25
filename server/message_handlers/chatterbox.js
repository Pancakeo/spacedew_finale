"use strict";
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var server_settings = require('../managers/server_settings');
var chat_commands = require('../chat_commands');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    var room = wiseau.get_room(data.room_id);

    if (room == null) {
        return;
    }

    var handle = {
        chat: function() {
            var message = data.message;

            if (message.length > 0) {
                var do_chat = chat_commands.exec(message, sessionator, room.id);

                if (do_chat) {
                    var recent_message = session.profile.username + ': ' + message;
                    room.add_recent_message(recent_message);

                    sessionator.broadcast('chatterbox', 'chat', {message: message, username: session.profile.username}, {room_id: room.id});
                }
            }
        },
        blargh: function() {
            if (data.message.length > 0) {
                sessionator.broadcast('chatterbox', 'blargh', {message: data.message, username: session.profile.username}, {room_id: room.id, strip_entities: false});
            }
        },
        change_room_name: function() {
            if (room == null) {
                return;
            }

            var room_name = data.name;
            room.name = room_name;
            sessionator.broadcast('chatterbox', 'change_room_name', {new_name: room.name, blame: session.profile.username}, {room_id: room.id});
            server_settings.set('lobby_room_name', room.name);
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
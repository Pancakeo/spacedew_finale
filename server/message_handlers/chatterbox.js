"use strict";
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var chat_commands = require('../chat_commands');
var configuration = require('../conf/configuration');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    var room = wiseau.get_room(data.room_id);

    var handle = {
        chat: function() {
            if (room == null) {
                return;
            }

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
            if (room == null) {
                return;
            }

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

            var recent_message = session.profile.username + ' changed the room name to ' + data.name;
            room.add_recent_message(recent_message);

            sessionator.broadcast('chatterbox', 'change_room_name', {new_name: room.name, blame: session.profile.username}, {room_id: room.id});
            configuration.set('lobby_room_name', room.name);
        },
        join_room: function() {
            if (!data.name || data.name.length == 0) {
                return;
            }

            var room = wiseau.get_room_by_name(data.name);

            if (room == null) {
                room = wiseau.create_room(data.name);
                room.join_room(session.profile.username);
                session.send('chatterbox', 'join_room', room, {});
            }
            else {
                // already exists.

                if (!room.is_member(session.profile.username)) {
                    room.join_room(session.profile.username);
                    session.send('chatterbox', 'join_room', room, {});
                }
            }
        },
        create_transfer_progress: function() {
            if (room == null) {
                return;
            }

            var recent_message = session.profile.username + ' sent ' + data.name;
            room.add_recent_message(recent_message);

            sessionator.broadcast('chatterbox', 'create_transfer_progress', {
                size: data.size,
                name: data.name,
                transfer_id: data.transfer_id,
                username: session.profile.username
            }, {room_id: room.id});
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
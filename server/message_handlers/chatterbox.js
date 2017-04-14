"use strict";
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var chat_commands = require('../chat_commands');
var configuration = require('../conf/configuration');

app.leave_room = function(username, room_id) {
    sessionator.broadcast('chatterbox', 'system', {message: username + " leaves the room :/", color: 'red'}, {room_id: room_id});
};

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    var room = wiseau.get_room(data.room_id);

    let invite_to_room = function(invite_info) {
        invite_info = Object.assign({
            room_name: room && room.name
        }, invite_info);

        if (invite_info.username != null) {
            let matching_session = sessionator.get_session_by_user(invite_info.username);

            if (matching_session) {
                if (!room.is_member(matching_session.username)) {
                    matching_session.send('chatterbox', 'boom_boom', {room_name: invite_info.room_name, room_id: invite_info.room_id, invited_by: session.profile.username});
                    session.send('chatterbox', 'system', {room_id: invite_info.room_id, message: "Invitation sent to " + invite_info.username, color: 'green'});
                }
            }
        }
    };

    var handle = {
        chat: function() {
            if (room == null) {
                return;
            }

            if (session.is_silenced) {
                session.send('chatterbox', 'system', {message: "You've been silenced due to a recent warning.", color: 'red', room_id: room.id});
                return;
            }

            var message = data.message;

            if (message.length > 0) {
                var do_chat = chat_commands.exec(message, sessionator, room.id);

                if (do_chat) {
                    var recent_message = session.profile.username + ': ' + message;
                    room.add_recent_message(recent_message);

                    sessionator.broadcast('chatterbox', 'chat', {message: message, username: session.profile.username, team: data.team}, {room_id: room.id});
                }
            }
        },
        blargh: function() {
            if (room == null) {
                return;
            }

            if (session.is_silenced) {
                session.send('chatterbox', 'system', {message: "You've been silenced due to a recent warning.", color: 'red', room_id: room.id});
                return;
            }

            if (data.message.length > 0) {
                var recent_message = session.profile.username + ': ' + data.message;
                room.add_recent_message(recent_message);
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
        create_room: function() {
            if (!data.name || data.name.trim().length == 0) {
                return;
            }

            data.name = app.wuptil.trim_string(data.name);

            room = wiseau.create_room(data.name);
            room.join_room(session.profile.username);
            event_bus.emit('update_userlist', {});
            session.send('chatterbox', 'join_room', room, {});
            session.send('chatterbox', 'system', {room_id: room.id, message: "Welcome to " + data.name + '.', color: 'blue'});

            if (data.invite) {
                invite_to_room({
                    room_id: room.id,
                    room_name: room.name,
                    username: data.invite
                });
            }

        },
        invite_to_room: function() {
            invite_to_room(data);
        },
        join_room: function() {
            if (room != null && !room.is_member(session.profile.username)) {
                session.send('chatterbox', 'join_room', room, {});
                room.join_room(session.profile.username);
                event_bus.emit('update_userlist', {});
                sessionator.broadcast('chatterbox', 'system', {message: session.profile.username + " joined the room!", color: 'green'}, {room_id: room.id});
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
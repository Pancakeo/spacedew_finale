"use strict";
var event_bus = require(global.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var handle = {
        users_list: function() {
            var room = wiseau.get_room(data.room_id);
            if (room == null) {
                return;
            }

            session.send('users', 'users_list', {users: room.users, room_id: room.id});
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};

event_bus.on('login', function(params) {
    var username = params.username;

    if (username == null || username.length == '') {
        throw 'wup find username';
    }

    var lobby = wiseau.get_lobby();
    lobby.join_room(username);
    sessionator.broadcast('users', 'users_list', {users: lobby.users, room_id: lobby.id});
});

event_bus.on('logout', function(params) {
    var username = params.username;

    var lobby = wiseau.get_lobby();
    lobby.leave_room(username);
    sessionator.broadcast('users', 'users_list', {users: lobby.users, room_id: lobby.id});
});
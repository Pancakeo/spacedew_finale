"use strict";

var uuid = require('node-uuid');
var moment = require('moment');

var rooms = {};
var lobby_room;

var MAX_MESSAGES = 15;

exports.create_room = function(room_name, room_id) {
    room_id = room_id || uuid.v4();

    var room = {
        name: room_name,
        id: room_id,
        users: [],
        recent_messages: [],
        add_recent_message: function(message) {
            if (room.recent_messages.length >= MAX_MESSAGES) {
                room.recent_messages.shift();
            }

            room.recent_messages.push({message: message, timestamp: Date.now()});
        },
        is_member: function(username) {
            for (var i = 0; i < room.users.length; i++) {
                var user = room.users[i];

                if (user.username.toLowerCase() == username.toLowerCase()) {
                    return true;
                }
            }

            return false;
        },
        join_room: function(username) {
            for (var i = 0; i < room.users.length; i++) {
                var user = room.users[i];

                if (user.username.toLowerCase() == username.toLowerCase()) {
                    room.users.splice(i, 1);
                    i--;
                }
            }

            room.users.push({username: username});
        },
        leave_room: function(username) {
            for (var i = 0; i < room.users.length; i++) {
                var user = room.users[i];

                if (user.username.toLowerCase() == username.toLowerCase()) {
                    room.users.splice(i, 1);
                    i--;
                }
            }
        }
    };

    rooms[room_id] = room;
    return room;
};

exports.kill_room = function(room_id) {
    // maybe do something if room is populated??
    delete rooms[room_id];
};

exports.get_room = function(room_id) {
    return rooms[room_id];
};

exports.get_room_by_name = function(room_name) {
    for (var room_id in rooms) {
        var room = rooms[room_id];
        if (room.name.toLowerCase() == room_name.toLowerCase()) {
            return room;
        }
    }
};

exports.get_lobby = function() {
    return lobby_room;
};

// Create lobby
var lobby_room_id = uuid.v4();
var lobby_room_name = app.config.lobby_room_name;
lobby_room = exports.create_room(lobby_room_name, lobby_room_id);
"use strict";

const DEFAULT_LOBBY_NAME = "Tom Clancy's Rocket Ballz";

var uuid = require('node-uuid');
var server_settings = require('./server_settings');

var rooms = {};
var lobby_room;

exports.create_room = function(room_name, room_id) {
    room_id = room_id || uuid.v4();

    var room = {
        name: room_name,
        id: room_id,
        users: [],
        recent_messages: [],
        bob_ross: []
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

exports.get_lobby = function() {
    return lobby_room;
};

// Create lobby
var lobby_room_id = uuid.v4();
var lobby_room_name = server_settings.get().lobby_room_name || DEFAULT_LOBBY_NAME;
lobby_room = exports.create_room(lobby_room_name, lobby_room_id);
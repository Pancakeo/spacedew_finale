"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var _ = require("lodash");
var board = require(app.shared_root + '/crabble_stuff').board;
var uuid = require('node-uuid');

var games = {};

var broadcast = function(game_id, sub_type, data) {
    sessionator.broadcast(exports.key, sub_type, data, {
        room_id: game_id,
        require_logged_in: false
    });
};

exports.get_game = function(game_id) {
    return games[game_id];
};

exports.requires_auth = false;
exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    var page_key = exports.key;

    switch (sub_type) {
        case 'create_game':
            var game_id = uuid.v4();

            // Hack for testing.
            if (!session.profile.username) {
                session.profile.username = data.username;
            }

            var game_room = wiseau.create_room(game_id, game_id);
            game_room.join_room(session.profile.username);

            var game = {
                game_id: game_id,
                sessions: [session],
                host: session,
                last_activity: Date.now()
            };

            games[game_id] = game;

            session.send(page_key, 'game_ready', {
                game_id: game_id,
                players: [session.profile.username]
            });
            break;

        case 'chat':
            console.log(data);
            broadcast(data.game_id, 'chat', {username: session.profile.username, message: data.message});
            break;

        default:
            break;
    }

};
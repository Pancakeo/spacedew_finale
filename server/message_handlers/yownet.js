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
        case 'games_list':
            var games_list = [];

            for (var game_id in games) {
                var game = games[game_id];

                var game_players = game.sessions.map(function(s) {
                    return s.profile.username;
                });

                if (Date.now() - game.last_activity <= (1000 * 60 * 15)) {
                    games_list.push({
                        game_id: game_id,
                        game_name: game.name,
                        game_type: game.type,
                        max_players: game.max_players,
                        players: game_players,
                        host: game.host.profile.username
                    });
                }
            }

            session.send(page_key, 'games_list', {games_list: games_list});
            break;

        case 'join_game':
            var game = games[data.game_id];

            if (!game) {
                session.send(page_key, 'join_game', {success: false});
                return;
            }

            // Hack for testing.
            if (!session.profile.username) {
                session.profile.username = data.username;
            }

            game.sessions.push(session);

            var game_players = game.sessions.map(function(s) {
                return s.profile.username;
            });

            session.send(page_key, 'join_game', {
                success: true,
                game: {
                    game_name: game.name,
                    players: game_players,
                    max_players: game.max_players
                }
            });
            break;

        case 'create_game':
            var game_id = uuid.v4();

            // Hack for testing.
            if (!session.profile.username) {
                session.profile.username = data.username;
            }

            var game_room = wiseau.create_room(game_id, game_id);
            game_room.join_room(session.profile.username);

            var game = {
                name: data.game_name,
                type: data.game_type,
                max_players: data.max_players || 2,
                game_id: game_id,
                sessions: [session],
                host: session,
                last_activity: Date.now()
            };

            games[game_id] = game;

            session.send(page_key, 'create_game', {
                game_id: game_id,
                max_players: game.max_players,
                game_name: game.name,
                players: [session.profile.username]
            });
            break;

        case 'chat':
            broadcast(data.game_id, 'chat', {username: session.profile.username, message: data.message});
            break;

        default:
            break;
    }

};
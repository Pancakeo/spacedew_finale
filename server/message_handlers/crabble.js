"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var wuptil = require('../util/wuptil');
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

var end_turn = function(game_id, action) {
    var game = games[game_id];
    if (!game) {
        return;
    }

    var game_state = game.game_state;
    game_state.players.some(function(p, idx) {
        if (p == game_state.hot_seat) {
            if (idx == (game_state.players.length - 1)) {
                game_state.hot_seat = game_state.players[0];
            }
            else {
                game_state.hot_seat = game_state.players[idx + 1];
            }

            return true;
        }
    });

    if (game_state.hot_seat.bot) {
        setTimeout(function() {
            end_turn(game_id, 'pass');
        }, 1000);
    }

    broadcast(game.game_id, 'end_turn', {action: action});
    broadcast(game.game_id, 'current_turn', {hot_seat: game_state.hot_seat.name});
};

exports.requires_auth = false;
exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    var page_key = exports.key;

    switch (sub_type) {
        case 'end_turn':
            end_turn(data.game_id, data.action);
            break;

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
                        max_players: game.max_players,
                        players: game_players,
                        host: game.host.profile.username
                    });
                }
            }

            session.send(page_key, 'games_list', {games_list: games_list});
            break;

        case 'join_game':
            // TODO
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
                max_players: data.max_players || 2,
                game_id: game_id,
                sessions: [session],
                host: session,
                last_activity: Date.now()
            };

            games[game_id] = game;

            session.send('crabble', 'create_game', {
                game_id: game_id,
                max_players: game.max_players,
                game_name: game.name,
                players: [session.profile.username]
            });
            break;

        case 'start_game':
            var game = games[data.game_id];
            if (!game) {
                console.log("No such game " + data.game_id);
                return;
            }

            var game_state = {
                sack: board.get_sack(),
                game_id: data.game_id,
                players: []
            };

            game.game_state = game_state;

            var bots = game.max_players - game.sessions.length;
            var create_player = function(name, session) {
                var player = {
                    letters: [],
                    name: name,
                    score: 0,
                    bot: (session == null)
                };

                Object.defineProperty(player, 'session', {
                    value: session,
                    enumerable: false
                });

                var letters = _.sampleSize(game_state.sack, 7);
                letters.forEach(function(letter) {
                    var idx = game_state.sack.indexOf(letter);
                    game_state.sack.splice(idx, 1);
                });

                player.letters = player.letters.concat(letters);

                game_state.players.push(player);
                return player;
            };

            game.sessions.forEach(function(s, idx) {
                var p = create_player(s.profile.username, session);

                if (idx == 0) {
                    game_state.hot_seat = p;
                }
            });

            var bot_names = _.sampleSize(["Hoebaer Granville", "Aristophanes Adam", "Serafim Rudo", "Jean-Baptiste Gaël", "Alfarr Payam", "Markos He",
                "Elioenai Germano", "Lauri Mohammed", "Iestyn Ferdinand"], bots);

            bot_names.forEach(function(name) {
                create_player(name);
            });

            var world = game_state.players.map(function(p) {
                return {name: p.name, score: p.score};
            });

            game_state.players.forEach(function(p) {
                if (p.bot) {
                    return;
                }

                p.session.send(page_key, 'setup', {
                    my_stuff: p,
                    game_id: game_state.game_id,
                    world: world
                })
            });

            broadcast(game.game_id, 'current_turn', {hot_seat: game_state.hot_seat.name});
            break;

        default:
            break;
    }

};
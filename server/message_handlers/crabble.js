"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var _ = require("lodash");
var board = require(app.shared_root + '/crabble_stuff').board;

var yownet = require('./yownet');

var broadcast = function(game_id, sub_type, data) {
    sessionator.broadcast(exports.key, sub_type, data, {
        room_id: game_id
    });
};

var end_turn = function(game_id, action) {
    var game = yownet.get_game(game_id);
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

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    var page_key = exports.key;

    switch (sub_type) {
        case 'end_turn':
            end_turn(data.game_id, data.action);
            break;

        case 'start_game':
            var game = yownet.get_game(data.game_id);
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
                var p = create_player(s.profile.username, s);

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
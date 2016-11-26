"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var wuptil = require('../util/wuptil');
var _ = require("lodash");
var board = require(app.shared_root + '/crabble_stuff').board;
var uuid = require('node-uuid');

var hosted_games = {};

exports.requires_auth = false;
exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;
    var page_key = exports.key;

    // var room = wiseau.get_room(data.room_id);
    // if (room == null) {
    //     return;
    // }

    switch (sub_type) {
        case 'create_game':
            var game_id = uuid.v4();

            // Hack for testing.
            if (!session.profile.username) {
                session.profile.username = data.username;
            }

            var game = {
                name: data.game_name,
                max_players: data.max_players || 2,
                game_id: game_id,
                sessions: [session],
                host: session
            };

            hosted_games[game_id] = game;

            session.send('crabble', 'create_game', {
                game_id: game_id
            });
            break;

        case 'start_game':
            var hosted_game = hosted_games[data.game_id];
            if (!hosted_game) {
                console.log("No such game " + data.game_id);
                return;
            }

            var game = {
                sack: board.get_sack(),
                players: {},
                current_turn: null
            };

            var bots = hosted_game.max_players - hosted_game.sessions.length;
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

                var letters = _.sampleSize(game.sack, 7);
                letters.forEach(function(letter) {
                    var idx = game.sack.indexOf(letter);
                    game.sack.splice(idx, 1);
                });

                player.letters = player.letters.concat(letters);

                game.players[name] = player;
            };

            hosted_game.sessions.forEach(function(s) {
                create_player(s.profile.username, session);
            });

            var bot_names = _.sampleSize(["Hoebaer Granville", "Aristophanes Adam", "Serafim Rudo", "Jean-Baptiste Gaël", "Alfarr Payam", "Markos He", "Elioenai Germano", "Lauri Mohammed", "Iestyn Ferdinand"], bots);
            bot_names.forEach(function(name) {
                create_player(name);
            });

            var world = {};
            for (var name in game.players) {
                var p = game.players[name];

                world[name] = {
                    name: name,
                    score: p.score
                }
            }

            for (var name in game.players) {
                var p = game.players[name];

                if (p.bot) {
                    continue;
                }

                p.session.send(page_key, 'setup', {
                    my_stuff: p,
                    world: world
                })
            }

            break;

        default:
            break;
    }

};
"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
const _ = require("lodash");
const board = require(app.shared_root + '/crabble_stuff').board;
const uuid = require('node-uuid');

const games = {};

const broadcast = function(game_id, sub_type, data) {
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
    let sub_type = message.sub_type;
    let data = message.data;
    let page_key = exports.key;
    let game = games[data.game_id];

    let handlers = {
        chat: function() {
            broadcast(data.game_id, 'event', {
                type: 'chat',
                username: session.profile.username,
                message: data.message
            });
        },
        remove_bot: function() {
            if (game != null) {
                let success = false;

                for (let i = 0; i < game.players.length; i++) {
                    let p = game.players[i];
                    if (p.id == data.id) {
                        success = true;
                        game.players.splice(i, 1);
                        i--;
                    }
                }

                broadcast(data.game_id, 'event', {
                    type: 'remove_bot',
                    id: data.id
                })
            }
        },
        add_bot: function() {
            if (game != null && game.players.length < game.max_players) {

                let bot = {
                    bot: true,
                    name: 'Botty ' + Math.floor(Math.random() * 1000),
                    id: app.wuptil.generate_id()
                };

                game.players.push(bot);

                broadcast(data.game_id, 'event', {
                    type: 'add_bot',
                    id: bot.id,
                    team: 'Team 2',
                    name: bot.name,
                    teams: game.teams
                })
            }
        },
        start_game: function() {
            if (game) {
                if (game.players.length < game.min_players) {
                    broadcast(data.game_id, 'event', {
                        type: 'system',
                        message: "Not enough players."
                    });
                }
                else if (game.players.length > game.max_players) {
                    broadcast(data.game_id, 'event', {
                        type: 'system',
                        message: "Too many players!"
                    });
                }
                else {
                    broadcast(data.game_id, 'event', {
                        type: 'start_game'
                    });
                }
            }
        },
        set_game_name: function() {
            if (game != null && data.game_name.trim().length > 0) {
                game.game_name = data.game_name.trim();
                broadcast(data.game_id, 'event', {
                    type: 'rename_game',
                    game_name: game.game_name
                });
            }
        },
        create_game: function() {
            let game_id = uuid.v4();

            // Hack for testing.
            if (!session.profile.username) {
                session.profile.username = data.username;
            }

            let game_room = wiseau.create_room(game_id, game_id);
            game_room.join_room(session.profile.username);

            game = {
                game_id: game_id,
                game_type: data.game_type,
                game_name: data.game_name,
                sessions: [session],
                host: session,
                last_activity: Date.now(),
                teams: [],
                players: [{
                    name: session.profile.username,
                    team: 'Team 1'
                }],
                debug: function() {
                    let en_bref = Object.assign({}, game);
                    delete en_bref.sessions;
                    delete en_bref.host;
                    delete en_bref.debug;
                    return en_bref;
                }
            };

            game.min_players = 2;

            if (data.game_type == 'Tick Tack') {
                game.max_players = 2;
            }
            else {
                game.max_players = 4;
            }

            for (let i = 1; i <= game.max_players; i++) {
                game.teams.push('Team ' + i);
            }

            game.teams.push("Observer");
            games[game_id] = game;

            session.send(page_key, 'event', {
                type: 'game_ready',
                game_id: game_id,
                players: game.players,
                teams: game.teams,
                instance_id: data.instance_id,
                max_players: game.max_players
            });
        }
    };

    if (typeof(handlers[sub_type]) == "function") {
        handlers[sub_type]();
    }
};
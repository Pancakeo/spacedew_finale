"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
const _ = require("lodash");
const board = require(app.shared_root + '/crabble_stuff').board;
const uuid = require('node-uuid');

const games = {};

exports.get_game = function(room_id) {
    return games[room_id];
};

exports.handle_message = function handle_message(session, message) {
    let sub_type = message.sub_type;
    let data = message.data;
    let page_key = exports.key;

    let game = games[data.room_id];

    const broadcast = function(type, send_data) {
        if (send_data == null) {
            send_data = arguments[0];
        }
        else {
            send_data = Object.assign({}, {type: type}, send_data);
        }


        sessionator.broadcast(exports.key, 'event', send_data, {
            room_id: data.room_id
        });
    };

    const send = function(send_data) {
        Object.assign({room_id: data.room_id}, send_data);
        session.send(page_key, 'event', send_data);
    };

    let handlers = {
        chat: function() {
            broadcast({
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

                broadcast({
                    type: 'remove_bot',
                    id: data.id
                });
            }
        },
        add_bot: function() {
            if (game != null && game.players.length < game.max_players) {

                let bot = {
                    bot: true,
                    name: 'Botty ' + Math.floor(Math.random() * 1000),
                    id: app.wuptil.generate_id(),
                    in_game: true,
                    observer: false
                };

                game.players.push(bot);
                broadcast('add_bot', bot);
            }
        },
        start_game: function() {
            if (game) {
                if (game.players.length < game.min_players) {
                    broadcast({
                        type: 'system',
                        message: "Not enough players."
                    });
                }
                else if (game.players.length > game.max_players) {
                    broadcast({
                        type: 'system',
                        message: "Too many players!"
                    });
                }
                else {
                    broadcast({
                        type: 'start_game'
                    });
                }
            }
        },
        set_game_name: function() {
            if (game != null && data.game_name.trim().length > 0) {
                game.game_name = data.game_name.trim();

                broadcast({
                    type: 'rename_game',
                    game_name: game.game_name
                });
            }
        },
        create_game: function() {
            let room_id = uuid.v4();

            // Hack for testing.
            if (!session.profile.username) {
                session.profile.username = data.username;
            }

            let game_room = wiseau.create_room(room_id, room_id);
            game_room.join_room(session.profile.username);

            game = {
                room_id: room_id,
                game_type: data.game_type,
                game_name: data.game_name,
                last_activity: Date.now(),
                min_players: 2,
                max_players: 4,
                ready: function() {
                    return game.players.every(p => p.in_game);
                },
                players: [{
                    name: session.profile.username,
                    observer: false
                }]
            };

            Object.defineProperty(game, 'sessions', {
                value: [session]
            });

            Object.defineProperty(game, 'host', {
                value: session
            });

            if (data.game_type == 'Tick Tack') {
                game.max_players = 2;
            }
            else {
                game.max_players = 4;
            }

            games[room_id] = game;

            send({
                type: 'game_ready',
                room_id: game.room_id,
                instance_id: data.instance_id,
                game: game
            });
        }
    };

    if (typeof(handlers[sub_type]) == "function") {
        handlers[sub_type]();
    }
};
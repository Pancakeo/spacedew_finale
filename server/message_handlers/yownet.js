"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
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

    const broadcast = function(sub_type, broadcast_data) {
        broadcast_data = Object.assign({}, broadcast_data);

        sessionator.broadcast(exports.key, sub_type, broadcast_data, {
            room_id: data.room_id
        });
    };

    const send = function(sub_type, message) {
        message = Object.assign({}, message, {room_id: data.room_id});
        session.send(page_key, sub_type, message);
    };

    const is_host = function(session) {
        if (!game || !session) {
            return false;
        }

        return game.host.profile.username == session.profile.username;
    };

    let handlers = {
        sorry_jimmy: function() {
            let matching_session = sessionator.get_session_by_user(data.username);
            let room = wiseau.get_room(data.room_id);

            if (matching_session && room && game) {
                if (!room.is_member(matching_session.username)) {
                    matching_session.send('chatterbox', 'sorry_jimmy', {invited_by: session.profile.username, game_name: game.game_name, game_type: game.game_type, room_id: data.room_id});

                    send('system', {message: 'Invited ' + matching_session.username})
                }
            }
        },
        chat: function() {
            broadcast('chat', {
                username: session.profile.username,
                message: data.message
            });
        },
        remove_bot: function() {
            // TODO host check
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

                broadcast('remove_bot', {
                    id: data.id
                });
            }
        },
        add_bot: function() {
            // TODO host check
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
            if (game && session.profile.username) {
                if (game.players.length < game.min_players) {
                    broadcast('system', {
                        message: "Not enough players."
                    });
                }
                else if (game.players.length > game.max_players) {
                    broadcast('system', {
                        message: "Too many players!"
                    });
                }
                else {
                    broadcast('start_game');
                }
            }
        },
        set_game_key: function() {
            if (game) {
                game.game_key = data.game_key;
                switch (data.game_key) {
                    case 'c4':
                        game.game_type = "Captain's Mistress";
                        break;
                    case 'tick_tack':
                        game.game_type = "Noughts and Crosses";
                        break;
                    default:
                        game.game_type = "HEH";
                        break;
                }

                broadcast('update_game', {game: game});
            }
        },
        set_game_name: function() {
            // TODO host check
            if (game != null && data.game_name.trim().length > 0) {
                game.game_name = data.game_name.trim();

                broadcast('rename_game', {
                    game_name: game.game_name
                });
            }
        },
        create_game: function() {
            let room_id = uuid.v4();

            let game_room = wiseau.create_room(data.game_name, room_id);
            game_room.join_room(session.profile.username);

            let game_type = "Captain's Mistress";
            let game_key = 'c4';

            game = {
                room_id: room_id,
                game_type: game_type,
                game_key: game_key,
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

            Object.defineProperty(game, 'game_name', {
                get: function() {
                    return game_room.name;
                },
                set: function(val) {
                    game_room.name = val;
                },
                enumerable: true
            });

            Object.defineProperty(game, 'sessions', {
                value: [session]
            });

            Object.defineProperty(game, 'host', {
                value: session
            });

            let two_player_games = ['tick_tack', 'c4'];
            if (two_player_games.includes(game_key)) {
                game.max_players = 2;
            }
            else {
                game.max_players = 4;
            }

            games[room_id] = game;

            send('game_ready', {
                room_id: game.room_id,
                instance_id: data.instance_id,
                game: game
            });

            if (data.invite_user != null) {
                let matching_session = sessionator.get_session_by_user(data.invite_user);

                if (matching_session) {
                    if (!game_room.is_member(matching_session.username)) {
                        matching_session.send('chatterbox', 'sorry_jimmy', {game_name: game.game_name, game_type: game.game_type, room_id: game.room_id, invited_by: session.profile.username});
                        send('system', {room_id: game.room_id, message: "Invitation sent to " + data.invite_user, color: 'green'});
                    }
                }
            }
        },
        join_game: function() {
            if (data.room_id == null) {
                return;
            }

            let game_room = wiseau.get_room(data.room_id);
            if (!game_room || game_room.is_member(session.profile.username)) {
                return;
            }

            let player = {
                name: session.profile.username,
                observer: false
            };
            broadcast('add_player', player);
            game_room.join_room(session.profile.username);

            game.players.push(player);
            // TODO remove player

            send('game_ready', {
                room_id: game.room_id,
                game: game
            });
        }
    };

    if (typeof(handlers[sub_type]) == "function") {
        handlers[sub_type]();
    }
};
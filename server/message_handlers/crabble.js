"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var _ = require("lodash");
var board = require(app.shared_root + '/crabble_stuff').board;

var yownet = require('./yownet');

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

    const broadcast = function(sub_type, broadcast_data) {
        sessionator.broadcast(exports.key, sub_type, broadcast_data, {
            room_id: data.room_id
        });
    };

    const send = function(sub_type, message) {
        message = Object.assign(message, {room_id: data.room_id});
        session.send(page_key, sub_type, message);
    };

    switch (sub_type) {
        case 'enter_game':
            let player = get_player(session.profile.username);
            player.in_game = true;

            broadcast('system', {message: session.profile.username + " has joined the game."});
            send('player_info', {username: session.profile.username});

            if (game.ready()) {
                game.create_game = function() {
                    game.board = [];
                    for (let row = 1; row <= ROWS; row++) {
                        for (let col = 1; col <= COLS; col++) {
                            let tile = {row: row, col: col, letter: null};
                            game.board.push(tile);
                        }
                    }

                    game.board.get_cell = function(col, row) {
                        let matching_cell;
                        game.board.some(function(cell) {
                            if (cell.col == col && cell.row == row) {
                                matching_cell = cell;
                                return true;
                            }
                        });

                        return matching_cell;
                    };

                    game.next_player = function() {
                        game.players.some(function(p) {
                            if (p.name != game.current_turn && !p.observer) {
                                game.current_turn = p.name;
                                return true;
                            }
                        });

                        return game.current_turn;
                    };

                    game.over = function() {
                        let game_over = game.board.some(function(cell) {
                            if (cell.letter) {
                                let triples = [];
                                triples.push([cell, game.board.get_cell(cell.col + 1, cell.row), game.board.get_cell(cell.col + 2, cell.row)]);
                                triples.push([cell, game.board.get_cell(cell.col, cell.row + 1), game.board.get_cell(cell.col, cell.row + 2)]);
                                triples.push([cell, game.board.get_cell(cell.col + 1, cell.row + 1), game.board.get_cell(cell.col + 2, cell.row + 2)]);
                                triples.push([cell, game.board.get_cell(cell.col - 1, cell.row + 1), game.board.get_cell(cell.col - 2, cell.row + 2)]);

                                let match = triples.some(function(cell_set) {
                                    if (cell_set.every(c => c)) {
                                        return cell_set[0].letter == cell_set[1].letter
                                            && cell_set[0].letter == cell_set[2].letter;
                                    }
                                });

                                return match;
                            }
                        });

                        let draw = game.board.every(cell => cell.letter);

                        if (game_over) {
                            broadcast('system', {message: game.current_turn + " wins the game!"});
                        }
                        else if (draw) {
                            broadcast('system', {message: "It's a draw!"});
                        }

                        if (game_over || draw) {
                            game.current_turn = null;
                            broadcast('current_turn', {current_turn: null});
                            broadcast('system', {message: "Starting a new game in 3 seconds..."});

                            setTimeout(function() {
                                game.create_game();
                            }, 3000);

                            return true;
                        }
                    };

                    game.current_player = function() {
                        let player;

                        game.players.some(function(p) {
                            if (p.name == game.current_turn && !p.observer) {
                                player = p;
                                return true;
                            }
                        });

                        return player;
                    };

                    game.current_turn = _.sample(game.players.filter(p => p.observer != true)).name;
                    let player_x = get_player(game.current_turn);
                    let player_o;

                    game.players.some(function(p) {
                        if (p.name != game.current_turn && !p.observer) {
                            player_o = p;
                            return true;
                        }
                    });

                    player_x.letter = 'X';
                    player_o.letter = 'O';

                    broadcast('system', {message: game.current_turn + " will go first!"});
                    broadcast('game_ready', game);

                    let p = get_player(game.current_turn);
                    if (p.bot) {
                        compute_move(p);
                    }
                };

                game.create_game();
            }

            break;
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
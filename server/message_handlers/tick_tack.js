"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
const _ = require("lodash");
const uuid = require('node-uuid');
const yownet = require('./yownet');
const lodash = require('lodash');

const ROWS = 3;
const COLS = 3;

exports.handle_message = function handle_message(session, message) {
    let sub_type = message.sub_type;
    let data = message.data;
    let page_key = exports.key;
    let game = yownet.get_game(data.room_id);

    if (game == null) {
        return;
    }

    const broadcast = function(sub_type, broadcast_data) {
        sessionator.broadcast(exports.key, sub_type, broadcast_data, {
            room_id: data.room_id
        });
    };

    const send = function(sub_type, message) {
        message = Object.assign(message, {room_id: data.room_id});
        session.send(page_key, sub_type, message);
    };

    const get_player = function(name) {
        let player = null;

        game.players.some(function(p) {
            if (p.name == name) {
                player = p;
                return true;
            }
        });

        return player;
    };

    const compute_move = function(bot) {
        setTimeout(function() {
            let board_cell = _.sample(game.board.filter(cell => !cell.letter));
            board_cell.letter = bot.letter;
            broadcast('move', {cell: board_cell});

            if (!game.over()) {
                broadcast('current_turn', {current_turn: game.next_player()});

                let p = game.current_player();
                if (p.bot == true) {
                    compute_move(p);
                }
            }
        }, 1700);
    };

    let handlers = {
        enter_game: function() {
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
        },
        chat: function() {
            broadcast('chat', {username: session.profile.username, message: data.message});
        },
        move: function() {
            if (game.current_turn != session.profile.username || game.board == null) {
                return;
            }

            let board_cell = game.board.get_cell(data.cell.col, data.cell.row);
            if (board_cell && board_cell.letter == null) {
                let current_player = game.current_player();
                board_cell.letter = current_player.letter;
                broadcast('move', {cell: board_cell});

                if (!game.over()) {
                    broadcast('current_turn', {current_turn: game.next_player()});

                    let p = get_player(game.current_turn);
                    if (p.bot == true) {
                        compute_move(p);
                    }
                }
            }

        }
    };

    if (typeof(handlers[sub_type]) == "function") {
        handlers[sub_type]();
    }
};
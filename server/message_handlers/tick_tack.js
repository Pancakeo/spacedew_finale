"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
const _ = require("lodash");
const uuid = require('node-uuid');
const yownet = require('./yownet');

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

    let handlers = {
        enter_game: function() {
            if (!game.players_in_game.includes(session.profile.username)) {
                game.players_in_game.push(session.profile.username);
            }

            broadcast('system', {message: session.profile.username + " has joined the game."});
            send('player_info', {username: session.profile.username});

            if (game.ready()) {
                game.board = [];
                for (let row = 1; row <= ROWS; row++) {
                    for (let col = 1; col <= COLS; col++) {
                        let tile = {row: row, col: col, letter: null};
                        game.board.push(tile);
                    }
                }

                Object.defineProperty(game.board, 'get_cell', {
                    value: function(col, row) {
                        let matching_cell;
                        game.board.some(function(cell) {
                            if (cell.col == col && cell.row == row) {
                                matching_cell = cell;
                                return true;
                            }
                        });

                        return matching_cell;
                    }
                });

                broadcast('system', {message: "The game is ready to start!"});
                send('game_ready', {
                    board: game.board,
                    room_id: game.room_id,
                    current_turn: game.host.profile.username,
                    players: game.players
                });
            }
        },
        chat: function() {
            broadcast('chat', {username: session.profile.username, message: data.message});
        },
        move: function() {
            // if (game.current_turn != session.profile.username
            //     || game.board == null) {
            //     return;
            // }

            console.log(data.cell);
            let board_cell = game.board.get_cell(data.cell.col, data.cell.row);
            console.log('woboy', board_cell);
        }
    };

    if (typeof(handlers[sub_type]) == "function") {
        handlers[sub_type]();
    }
};
"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var wuptil = require('../util/wuptil');
var _ = require("lodash");
var board = require(app.shared_root + '/crabble_stuff').board;

exports.requires_auth = false;
exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    // var room = wiseau.get_room(data.room_id);
    // if (room == null) {
    //     return;
    // }

    switch (sub_type) {
        case 'setup':
            var game = {
                sack: board.get_sack(),
                players: {},
                current_turn: null
            };

            var create_player = function(name) {
                var player = {
                    letters: [],
                    name: name,
                    score: 0
                };

                var letters = _.sampleSize(game.sack, 7);
                console.log(letters);

                game.players[name] = player;
            };

            create_player('Player 1');
            create_player('Player 2');
            create_player('Player 3');
            create_player('Player 4');

            console.log(game);

            session.send(exports.key, 'setup', {letters: game.players['Player 1'].letters});
            break;

        default:
            break;
    }

};
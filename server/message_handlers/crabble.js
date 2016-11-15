"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var wuptil = require('../util/wuptil');
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
            var letters = [];
            session.send(exports.key, 'setup', {letters: letters});
            break;

        default:
            break;
    }

};
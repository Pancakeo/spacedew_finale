"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var wuptil = require('../util/wuptil');

var positions = {};
setInterval(function() {
    var at_least_one = false;
    var has_delete = false;

    for (var key in positions) {
        var p = positions[key];

        if (Date.now() - p.last_change <= 100) {
            at_least_one = true;
        }
        else if (Date.now() - p.last_change >= (1000 * 10)) {
            has_delete = true;
            delete positions[key];
        }
    }

    if (Object.keys(positions).length <= 1 && !has_delete) {
        return;
    }

    if (at_least_one || has_delete) {
        var room_id = wiseau.get_lobby().id;
        sessionator.broadcast('black_board', 'draw', {type: 'positions', positions: positions, room_id: room_id});
    }

}, 50);

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var room = wiseau.get_room(data.room_id);
    if (room == null) {
        return;
    }

    switch (sub_type) {
        case 'sync':
            session.send('black_board', 'load', {
                room_id: room.id,
                data: room.bob_ross.compress(),
                bg_color: room.bob_ross.bg_color
            });
            break;

        case 'draw':
            if (data.type == 'colorful_clear' && data.data.nuke) {
                room.bob_ross.clear(data.data.color);
                if (room.bob_ross.dirty) {
                    sessionator.broadcast('chatterbox', 'system', {message: session.profile.username + ' cleared the X-board.', room_id: data.room_id, color: 'green'});
                }
            }

            if (data.type == 'position') {
                positions[session.profile.username] = data.data;
            }

            room.bob_ross.handle_thing(data);
            data.username = session.profile.username;
            sessionator.broadcast('black_board', sub_type, data, {strip_entities: false});
            break;
        default:
            break;
    }

};
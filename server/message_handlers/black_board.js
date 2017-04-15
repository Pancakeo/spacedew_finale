"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
const wuptil = require('../util/wuptil');

let positions = {};
setInterval(function() {
    return;
    // TODO
    let at_least_one = false;
    let has_delete = false;

    for (let key in positions) {
        let p = positions[key];

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
        let room_id = wiseau.get_lobby().id;
        sessionator.broadcast('black_board', 'draw', {type: 'positions', positions: positions, room_id: room_id});
    }

}, 50);

exports.handle_message = function handle_message(session, message) {
    let sub_type = message.sub_type;
    let data = message.data;

    let room = wiseau.get_room(data.room_id);
    if (room == null) {
        return;
    }

    switch (sub_type) {
        case 'sync':
            room.bob_ross.sync(session);
            break;

        case 'draw':
            if (data.type == 'colorful_clear' && data.nuke) {
                if (room.bob_ross.paths.length > 0) {
                    sessionator.broadcast('chatterbox', 'system', {message: session.profile.username + ' cleared the X-board.', room_id: data.room_id, color: 'green'});
                }

                room.bob_ross.clear(data.color);
            }

            if (data.type == 'position') {
                positions[session.profile.username] = data;
            }

            room.bob_ross.handle_thing(data);
            data.username = session.profile.username;
            sessionator.broadcast('black_board', sub_type, data, {strip_entities: false});
            break;
        default:
            break;
    }

};
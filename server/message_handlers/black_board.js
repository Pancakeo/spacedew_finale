"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var wuptil = require('../util/wuptil');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var room = wiseau.get_room(data.room_id);
    if (room == null) {
        return;
    }

    switch (sub_type) {
        case 'sync':
            room.tent.canvas.toDataURL('image/png', function(err, png) {
                if (err != null) {
                    return;
                }

                var data = {
                    room_id: room.id,
                    data_src: png,
                    mini: false
                };

                session.send('black_board', 'load', data)
            });
            break;

        case 'draw':
            room.tent.handle_thing(data);
            data.username = session.profile.username;
            sessionator.broadcast('black_board', sub_type, data);
            break;
        default:
            break;
    }

};
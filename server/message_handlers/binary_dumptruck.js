"use strict";
var sessionator = require('../managers/sessionator');

exports.handle_buffer = function(session, buffer) {

    var header_length = buffer.readInt32LE(0);
    var header = buffer.slice(4, 4 + header_length);

    var header_json = '';
    for (var i = 0; i < header.length / 2; i++) {
        header_json += String.fromCharCode(header.readUInt16LE(i * 2));
    }

    var binary_data_buffer = buffer.slice(4 + header_length);

    var meta = JSON.parse(header_json);
    meta.username = session.profile.username;

    sessionator.broadcast_buffer(binary_data_buffer, meta, {room_id: meta.room_id, sender_session: session});
};
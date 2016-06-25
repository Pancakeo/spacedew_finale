"use strict";

exports.requires_auth = false;
exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    switch (sub_type) {
        case 'heartbeat':
            session.ping = Date.now() - data.ping_sent_at;
            session.last_activity = Date.now();
            break;

        default:
            break;
    }
};
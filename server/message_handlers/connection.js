"use strict";

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    switch (sub_type) {
        case 'heartbeat':

            break;

        default:
            break;
    }
};
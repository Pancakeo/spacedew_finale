"use strict";

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var handle = {};

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
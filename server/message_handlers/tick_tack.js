"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
const _ = require("lodash");
const uuid = require('node-uuid');

const broadcast = function(room_id, sub_type, data) {
    sessionator.broadcast(exports.key, sub_type, data, {
        room_id: room_id,
        require_logged_in: false
    });
};

exports.handle_message = function handle_message(session, message) {
    let sub_type = message.sub_type;
    let data = message.data;
    let page_key = exports.key;

    let handlers = {
        whew: function() {
            session.send(page_key, 'whew', {whewboy: true});
        }
    };

    if (typeof(handlers[sub_type]) == "function") {
        handlers[sub_type]();
    }
};
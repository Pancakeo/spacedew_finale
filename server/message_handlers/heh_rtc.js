"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
const wuptil = require('../util/wuptil');

event_bus.on('logout', function(params) {
    sessionator.broadcast(exports.key, 'close_rtc', {});
});

exports.handle_message = function handle_message(session, message) {
    const sub_type = message.sub_type;
    const data = message.data;

    const send = function(sub_type, send_data) {
        send_data = Object.assign({client_id: data.client_id}, send_data);
        session.send(exports.key, sub_type, send_data);
    };

    const broadcast = function(sub_type, send_data) {
        send_data = Object.assign({client_id: data.client_id}, send_data);
        sessionator.broadcast(exports.key, sub_type, send_data);
    };

    const handlers = {
        set_client_id: function() {
            session.profile.client_id = data.client_id;

            broadcast('college_try', {});
        },
        add_ice: function() {
            broadcast('add_ice', data);
        }
    };

    handlers[message.sub_type] && handlers[message.sub_type]();

};
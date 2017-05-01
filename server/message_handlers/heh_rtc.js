"use strict";
const event_bus = require(app.shared_root + '/event_bus');
const sessionator = require('../managers/sessionator');
const wiseau = require('../managers/wiseau');
const wuptil = require('../util/wuptil');

let ice_men = {};

event_bus.on('logout', function(params) {
    console.log('whew');
    sessionator.broadcast(exports.key, 'close_rtc', {});
    ice_men = {};
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
            let ice_o_matic = ice_men[data.client_id];

            if (!ice_o_matic) {
                ice_o_matic = [];
                ice_men[data.client_id] = ice_o_matic;
            }

            ice_o_matic.push(data);
            broadcast('add_ice', data);
        },
        que_paso: function() {
            let filtered_ice = {};

            sessionator.get_sessions({whew: true}).forEach(function(s) {
                filtered_ice[s.client_id] = ice_men[s.client_id];
            });

            send('que_paso', {ice_men: filtered_ice});
        }
    };

    handlers[message.sub_type] && handlers[message.sub_type]();

};
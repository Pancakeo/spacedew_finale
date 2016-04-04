"use strict";
var sessions = {};
var event_bus = require(global.shared_root + '/event_bus');

exports.broadcast = function(type, sub_type, data, options) {
    options = Object.assign({require_logged_in: true}, options);

    for (var key in sessions) {
        var session = sessions[key];

        if (options.require_logged_in && session.logged_in) {
            session.send(type, sub_type, data);
        }
        else if (!options.require_logged_in) {
            session.send(type, sub_type, data);
        }
    }
};

exports.connect = function(connection_id, ws) {
    var session = {};
    session = {
        ws: ws,
        connection_id: connection_id,
        ip_address: ws.upgradeReq && ws.upgradeReq.connection && ws.upgradeReq.connection.remoteAddress,
        logged_in: false,
        authenticated: false,
        profile: {},

        send: function(type, sub_type, data) {
            var message = {
                type: type,
                sub_type: sub_type,
                data: data
            };

            ws.send(JSON.stringify(message));
        },

        login: function(username) {
            session.logged_in = true;
            session.profile.username = username;
            console.log(username + " logged in.");
            session.authenticated = true;
            event_bus.emit('login', session.profile);
        },
        logout: function() {
            session.logged_in = false;
            console.log(session.profile.username + " logged out.");
            session.authenticated = false;
            event_bus.emit('logout', session.profile);
        },
        get_debug_info: function() {
            var wup = {};
            for (var key in session) {
                var val = session[key];

                if (key != 'ws' && typeof(val) != "function") {
                    wup[key] = session[key];
                }

            }

            return JSON.stringify(wup);
        }
    };

    // console.log("Connected.", session.get_debug_info());
    session.send('connection', 'connection_info', {fancy: true});
    session.send('connection', 'heartbeat', {ping_sent_at: Date.now()});

    sessions[connection_id] = session;
    return session;
};

exports.disconnect = function(connection_id) {
    var session = sessions[connection_id];

    if (session != null) {
        if (session.logged_in === true) {
            session.logout();
        }


        // console.log('Disconnected.', session.get_debug_info());
        delete sessions[connection_id];
    }
};

"use strict";
var sessions = {};
var event_bus = require(global.shared_root + '/event_bus');
var wiseau = require('./wiseau');

exports.get_sessions = function() {
    return sessions;
};

exports.broadcast = function(type, sub_type, data, options) {
    options = Object.assign({
        require_logged_in: true,
        room_id: null
    }, options);

    if (options.room_id != null) {
        data.room_id = options.room_id;
        var room = wiseau.get_room(options.room_id);
    }

    for (var key in sessions) {
        var session = sessions[key];

        if (options.require_logged_in && session.logged_in) {
            if (room != null) {

                if (room.is_member(session.profile.username) >= 0) {
                    session.send(type, sub_type, data);
                }
            }
            else {
                session.send(type, sub_type, data);
            }
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
        idle: false,

        send: function(type, sub_type, data) {
            var message = {
                type: type,
                sub_type: sub_type,
                data: data
            };

            ws.send(JSON.stringify(message));
        },
        logout_existing: function(username) {
            for (var key in sessions) {
                var s = sessions[key];
                if (s.profile.username && s.profile.username.toLowerCase() == username.toLowerCase()) {
                    s.logout();
                }
            }
        },
        login: function(username, user_id) {
            session.logout_existing(username);
            session.logged_in = true;
            session.profile.username = username;
            session.profile.user_id = user_id;
            console.log(username + " logged in.");
            session.authenticated = true;
            event_bus.emit('login', session.profile);
        },
        logout: function() {
            session.logged_in = false;
            console.log(session.profile.username + " logged out.");
            session.authenticated = false;
            event_bus.emit('logout', session.profile);

            try {
                session.ws.close();
            }
            catch (e) {
                console.log('Logout failure', e);
            }
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

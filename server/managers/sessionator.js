"use strict";
var sessions = {};
var event_bus = require(app.shared_root + '/event_bus');
var wiseau = require('./wiseau');

// Various tasks to do every so often.
setInterval(function() {
    for (var key in sessions) {
        var s = sessions[key];
        if (s.ws.readyState == 1) { // Connected
            if (Date.now() - s.last_activity >= (app.config.connection_timeout * 1000)) {
                var well_what_happen = s.profile.username + " timed out.";

                exports.broadcast('chatterbox', 'heartbeat', {ping_sent_at: Date.now()}, {require_logged_in: false});
                exports.broadcast('chatterbox', 'system', {message: well_what_happen}, {room_id: wiseau.get_lobby().id});

                console.log(well_what_happen);
                s.logout();
            }
        }
    }

    exports.broadcast('connection', 'heartbeat', {ping_sent_at: Date.now()}, {require_logged_in: false});
}, 7500);

exports.get_sessions = function() {
    return sessions;
};

exports.broadcast = function(type, sub_type, data, options) {
    options = Object.assign({
        require_logged_in: true,
        room_id: null,
        strip_entities: true
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
                    session.send(type, sub_type, data, {strip_entities: options.strip_entities});
                }
            }
            else {
                session.send(type, sub_type, data, {strip_entities: options.strip_entities});
            }
        }
        else if (!options.require_logged_in) {
            session.send(type, sub_type, data, {strip_entities: options.strip_entities});
        }
    }
};

exports.broadcast_buffer = function(buffer, meta, options) {
    options = Object.assign({
        room_id: null,
        sender_session: null
    }, options);

    var room = wiseau.get_room(options.room_id);

    for (var key in sessions) {
        var session = sessions[key];

        if (options.sender_session == session) {
            var special_meta = Object.assign({no_data: true}, meta);
            session.send_buffer(null, special_meta);
        }
        else {
            if (session.logged_in && room.is_member(session.profile.username)) {
                session.send_buffer(buffer, meta);
            }
        }
    }
};

// Strip < and > (which are one such way JV ruins the world, via <script>)
var clean_up = function(obj) {

    var clean_part = function(part) {
        if (typeof(part) == "string") {
            part = part.replace(/</g, '&lt;');
            part = part.replace(/>/g, '&gt;');
        }
        else if (part && typeof(part) == "object") {
            clean_up(part);
        }

        return part;
    };

    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            obj[i] = clean_part(obj[i]);
        }
    }
    else {
        for (var key in obj) {
            obj[key] = clean_part(obj[key]);
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
        last_activity: Date.now(),

        send: function(type, sub_type, data, send_options) {
            send_options = Object.assign({
                strip_entities: true
            }, send_options);

            var message = {
                type: type,
                sub_type: sub_type,
                data: data
            };

            if (send_options.strip_entities == true) {
                clean_up(data);
            }

            if (ws.readyState == 1) {
                try {
                    ws.send(JSON.stringify(message));
                }
                catch (e) {
                    console.log('send - session not connected.');
                }
            }
        },
        send_buffer: function(buffer, meta, send_options) {
            send_options = Object.assign({}, send_options);

            if (ws.readyState == 1) {
                var header_string = JSON.stringify(meta);
                var header = new Buffer(header_string.length * 2);

                for (var i = 0; i < header_string.length; i++) {
                    header.writeUInt16LE(header_string.charCodeAt(i), i * 2);
                }

                var header_length = new Buffer(4);
                header_length.writeUInt32LE(header.length, 0);

                if (buffer != null) {
                    var blob = Buffer.concat([header_length, header, buffer]);
                }
                else {
                    var blob = Buffer.concat([header_length, header]);
                }

                try {
                    ws.send(blob);
                }
                catch (e) {
                    console.log('send_buffer - session not connected.');
                }
            }
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
        // Also closes connection.
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

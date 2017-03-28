"use strict";
var sessions = {};
var event_bus = require(app.shared_root + '/event_bus');
var wiseau = require('./wiseau');
var mango = require('../managers/mango');
var star_wars = require('../stars/wupfindstar');

// Various tasks to do every so often.
setInterval(function() {
    for (var key in sessions) {
        var s = sessions[key];
        if (s.ws.readyState == 1) { // Connected
            if (Date.now() - s.last_activity >= (app.config.connection_timeout * 1000)) {

                if (s.logged_in == true) {
                    var well_what_happen = s.profile.username + " timed out.";
                    exports.broadcast('chatterbox', 'system', {message: well_what_happen}, {room_id: wiseau.get_lobby().id});
                    console.log(well_what_happen);
                }

                s.logout();
            }
        }
    }

    exports.broadcast('connection', 'heartbeat', {ping_sent_at: Date.now()}, {require_logged_in: false});
}, 7500);

exports.get_sessions = function(options) {
    options = Object.assign({
        whew: false,
        warning_levels: {}  // probably terrible to have this in usrs.js
    }, options);

    if (options.whew) {
        let ez_sessions = Object.keys(sessions).filter(function(id) {
            let s = sessions[id];
            return s.logged_in;
        }).map(function(id) {
            let whew = sessions[id].whew();
            whew.warning_level = options.warning_levels[whew.username] || 0;
            return whew;
        });
        return ez_sessions;
    }
    else {
        return sessions;
    }
};

exports.link_binary = function(binary_cid, binary_ws) {

    for (var cid in sessions) {
        if (cid == binary_cid) {
            var s = sessions[cid];
            s.binary_ws = binary_ws;

            s.queued_binary.forEach(function(transfer) {
                s.send_buffer(transfer.buffer, transfer.meta, transfer.send_options);
            });

            // console.log('Linked ' + cid + ' to binary conneciton.');
            return s;
        }
    }
};

event_bus.on('steam_openid.verify', function(good_stuff) {
    for (var cid in sessions) {
        var s = sessions[cid];
        if (s.auth_key == good_stuff.auth_key) {
            s.profile.steam_id = good_stuff.steam_id;
            event_bus.emit('update_userlist', {});

            // Update steam_id in db:
            var user_id = s.profile.user_id;
            mango.get().then(function(db) {
                var users = db.collection('users');

                users.findOne({user_id: user_id}).then(function(user) {
                    user.steam_id = good_stuff.steam_id;

                    users.updateOne({user_id: user_id}, {$set: {steam_id: good_stuff.steam_id}}).then(function() {
                        s.send('user_settings', 'steam_id', {steam_id: good_stuff.steam_id});
                        db.close();

                        star_wars.update_user(user);
                    });
                });

            });
            break;
        }
    }
});

exports.broadcast = function(type, sub_type, data, options) {
    options = Object.assign({
        require_logged_in: true,
        room_id: null,
        strip_entities: true
    }, options);

    if (options.room_id == null && data.room_id != null) {
        options.room_id = data.room_id;
    }

    if (options.room_id != null) {
        data.room_id = options.room_id;
        var room = wiseau.get_room(options.room_id);
    }

    for (var key in sessions) {
        var session = sessions[key];

        if (options.require_logged_in && session.logged_in) {
            if (room != null) {

                if (room.is_member(session.profile.username)) {
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
        binary_ws: null,
        connection_id: connection_id,
        ip_address: ws.upgradeReq && ws.upgradeReq.connection && ws.upgradeReq.connection.remoteAddress,
        logged_in: false,
        authenticated: false,
        profile: {},
        idle: false,
        last_activity: Date.now(),
        queued_binary: [],

        whew: function() {
            let s = session;

            let whewy = {
                // ip_address: s.ip_address,
                username: s.profile.username,
                idle: (s.idle == true),
                steam_id: s.profile.steam_id,
                ping: s.ping,
                rocket_league_rank: s.profile.rocket_league_rank,
            };

            if (s.idle == true && s.idle_start) {
                whewy.idle_duration = Date.now() - s.idle_start;
            }

            Object.defineProperty(whewy, 'send', {
                enumerable: false,
                value: session.send
            });

            return whewy;
        },

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

            if (!session.binary_ws) {
                session.queued_binary.push({buffer: buffer, meta: meta, send_options: send_options});
                return;
            }

            var binary_ws = session.binary_ws;

            if (binary_ws.readyState == 1) {
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
                    binary_ws.send(blob);
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
            exports.broadcast('users', 'roams_the_earth', {username: username});
        },
        // Also closes connection.
        logout: function() {
            if (session.logged_in) {
                console.log(session.profile.username + " logged out.");

                exports.broadcast('users', 'has_gone_to_a_better_place', {username: session.profile.username});
                wiseau.logout_user(session.profile.username);
                event_bus.emit('logout', session.profile);
            }

            session.logged_in = false;
            session.authenticated = false;

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
    session.send('connection', 'connection_info', {connection_id: connection_id});
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

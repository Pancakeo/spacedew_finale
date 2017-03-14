"use strict";
var event_bus = require(app.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var wuptil = require('../util/wuptil');

var warning_levels = {};
var WARNING_MAX = 100;

setInterval(function() {
    for (var key in warning_levels) {
        var decrease = wuptil.random(0, 5, true);
        warning_levels[key] = Math.max(warning_levels[key] - decrease, 0);
    }
    send_users_list();
}, 15000);

let send_users_list = function(room, session) {
    if (room == null) {
        room = wiseau.get_lobby();
    }

    var nice_users = wuptil.copy_object(room.users);
    var sessions = sessionator.get_sessions();

    for (var key in sessions) {
        var s = sessions[key];
        var idx = -1;

        for (var i = 0; i < nice_users.length; i++) {
            if (nice_users[i].username == s.profile.username) {
                idx = i;
                break;
            }
        }

        if (idx >= 0) {
            nice_users[idx].idle = (s.idle == true);
            nice_users[idx].ping = s.ping;
            nice_users[idx].steam_id = s.profile.steam_id;
            nice_users[idx].rocket_league_rank = s.profile.rocket_league_rank;
            nice_users[idx].warning_level = warning_levels[s.profile.username] || 0;

            if (s.idle == true && s.idle_start) {
                nice_users[idx].idle_duration = Date.now() - s.idle_start;
            }
        }
    }

    if (session == null) {
        sessionator.broadcast('users', 'users_list', {users: nice_users, room_id: room.id});
    }
    else {
        session.send('users', 'users_list', {users: nice_users, room_id: room.id});
    }
};

let send_ross = function(room, session) {
    session.send('black_board', 'load', {
        room_id: room.id,
        data: room.bob_ross.compress(),
        bg_color: room.bob_ross.bg_color
    });
};


exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var send_user_settings = function() {
        var user_settings = {};
        var sessions = sessionator.get_sessions();

        for (var key in sessions) {
            var s = sessions[key];
            if (s.logged_in) {
                user_settings[s.profile.username] = s.profile.user_settings;
            }
        }

        session.send('users', 'user_settings', {user_settings: user_settings});
    };

    var handle = {
        idle: function() {
            if (session.idle != true && data.idle == true) {
                session.idle_start = Date.now();
            }

            session.idle = data.idle;
            send_users_list();
        },
        sync: function() {
            var room = wiseau.get_room(data.room_id);
            if (room == null) {
                return;
            }

            send_user_settings();
            send_users_list(room, session);
            send_ross(room, session);
        },
        warn: function() {
            var sessions = sessionator.get_sessions();
            var evil_session = null;

            for (var cid in sessions) {
                var s = sessions[cid];
                if (s.profile.username == data.username) {
                    evil_session = s;
                    break;
                }
            }

            if (!evil_session || evil_session.is_silenced) {
                return;
            }

            var action = 'warned';
            if (data.super_warn) {
                action = 'really warned';
                var warning_increment = wuptil.random(67, 99, true);
            }
            else {
                var warning_increment = wuptil.random(1, 33, true);
            }

            if (warning_levels[evil_session.profile.username] == null) {
                warning_levels[evil_session.profile.username] = 0
            }

            warning_levels[evil_session.profile.username] += warning_increment;
            var current_warning = Math.min(100, warning_levels[evil_session.profile.username]);


            if (session.profile.username == data.username) {
                var message = evil_session.profile.username + ' ' + action + ' xemself.';
            }
            else {
                var message = session.profile.username + ' ' + action + ' ' + data.username + '.';
            }

            message += " " + data.username + "'s warning level has been increased to " + current_warning + '%.';
            sessionator.broadcast('chatterbox', 'system', {message: message, color: 'darkblue'}, {room_id: data.room_id});

            if (current_warning >= WARNING_MAX) {
                evil_session.is_silenced = true;

                setTimeout(function() {
                    evil_session.is_silenced = false;
                }, 30 * 1000);

                sessionator.broadcast('chatterbox', 'system', {message: evil_session.profile.username + " has been silenced for 30 seconds.", color: 'red'}, {room_id: data.room_id});
            }

            send_users_list();
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};

event_bus.on('login', function(params) {
    var username = params.username;

    if (username == null || username.length == '') {
        throw 'wup find username';
    }

    var lobby = wiseau.get_lobby();
    lobby.join_room(username);
    send_users_list();
});

event_bus.on('update_userlist', function(params) {
    send_users_list();
});

event_bus.on('logout', function(params) {
    var username = params.username;

    var lobby = wiseau.get_lobby();
    lobby.leave_room(username);
    send_users_list();
});
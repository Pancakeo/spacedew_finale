"use strict";
var sessionator = require('../managers/sessionator');
var crepto = require('../util/crepto');
var crypto = require('crypto');
var emu_list = require('../chat_commands/emu_list');
var mango = require('../managers/mango');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var handle = {
        change_password: function() {
            var alpha_numeric_regex = /^[A-Za-z0-9_]+$/;

            if (data.new_pw != data.confirm_pw) {
                session.send('user_settings', 'change_password', {success: false, reason: "Passwords don't match."});
                return;
            }

            if (data.new_pw.length < 4 || data.new_pw.length > 64) {
                session.send('user_settings', 'change_password', {success: false, reason: "Password must be 4-64 characters."});
                return;
            }

            if (alpha_numeric_regex.test(data.new_pw) !== true) {
                session.send('user_settings', 'change_password', {success: false, reason: "Shit's gotta be alphanumeric."});
                return;
            }

            mango.get().then(function(db) {
                var users = db.collection('users');

                users.findOne({user_id: session.profile.user_id}).then(function(user) {
                    let password_hasher = crepto.get_hashed_password;
                    let password_change_required = false;

                    if (user.last_password_change_date == null) {
                        password_hasher = crepto.get_legacy_hashed_password;
                        password_change_required = true;
                    }

                    password_hasher(user, data.current_pw).then(function(result) {
                        users.findOne({user_id: session.profile.user_id, password: result.hashed_password}).then(function(user_fishing) {
                            if (user_fishing == null) {
                                session.send('user_settings', 'change_password', {success: false, reason: "Current password is incorrect."});
                                db.close();
                                return;
                            }

                            crepto.hash_password(data.new_pw).then(function(new_password) {
                                users.updateOne({user_id: session.profile.user_id}, {
                                    $set: {
                                        last_password_change_date: new Date(),
                                        password: new_password.hashed_password,
                                        salty: new_password.salt
                                    }
                                }).then(function() {
                                    session.send('user_settings', 'change_password', {success: true});
                                    console.log(session.profile.username + " changed her password.");
                                    db.close();
                                });
                            });
                        });
                    });
                });
            });

        },
        outfit: function() {
            var user_id = session.profile.user_id;

            if (!data.outfit) {
                return;
            }

            if (JSON.stringify(data.outfit).length > (1024 * 1024)) {
                console.error("Server settings exceeded limit!");
                return;
            }

            mango.get().then(function(db) {
                var users = db.collection('users');
                var user_settings = {
                    outfit: data.outfit
                };

                users.updateOne({user_id: user_id}, {$set: {user_settings: user_settings}}).then(function() {
                    db.close();
                    session.profile.user_settings = user_settings;

                    var all_user_settings = {};
                    var sessions = sessionator.get_sessions();

                    for (var key in sessions) {
                        var s = sessions[key];
                        if (s.logged_in) {
                            all_user_settings[s.profile.username] = s.profile.user_settings;
                        }
                    }

                    sessionator.broadcast('users', 'user_settings', {
                        user_settings: all_user_settings
                    });

                    console.log("user settings updated for " + session.profile.username);
                });
            });
        },
        get_steam_id: function() {
            session.send('user_settings', 'steam_id', {steam_id: session.profile.steam_id});
        },
        clear_steam_id: function() {
            var user_id = session.profile.user_id;
            mango.get().then(function(db) {
                var users = db.collection('users');

                users.updateOne({user_id: user_id}, {$set: {steam_id: null, rl_max_rank: null}}).then(function() {
                    session.profile.rocket_league_rank = null;
                    session.profile.steam_id = null;
                    session.send('user_settings', 'steam_id', {steam_id: null});
                    db.close();
                });
            });
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
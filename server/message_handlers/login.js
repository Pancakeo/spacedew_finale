"use strict";

var crepto = require('../util/crepto');
var storage_thing = require('../managers/storage_thing');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var crypto = require('crypto');

exports.requires_auth = false;
exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var do_login = function(user, options) {
        options = Object.assign({
            reconnect: false
        }, options);

        storage_thing.each_param_sql('SELECT * FROM user_settings WHERE user_id = ?', [user.user_id]).then(function(result) {
            session.login(data.username, user.user_id);

            if (result.rows.length > 0) {
                session.profile.user_settings = JSON.parse(result.rows[0].settings_json);
            }
            else {
                session.profile.user_settings = {};
            }

            var auth_key = crypto.randomBytes(16).toString('hex');
            var user_id = user.user_id;

            var room = wiseau.get_lobby();
            room.join_room(session.profile.username);

            var page_key = 'login';
            var message_key = 'login';

            if (options.reconnect) {
                page_key = 'chatterbox';
                message_key = 'reconnect';
            }

            session.send(page_key, message_key, {
                    success: true,
                    username: data.username,
                    auth_key: auth_key,
                    lobby: wiseau.get_lobby()
                }
            );

            var user_settings = {};
            var sessions = sessionator.get_sessions();

            for (var key in sessions) {
                var s = sessions[key];
                if (s.logged_in) {
                    user_settings[s.profile.username] = s.profile.user_settings;
                }
            }

            sessionator.broadcast('users', 'user_settings', {
                user_settings: user_settings
            });

            storage_thing.run_param_sql("UPDATE user set auth_key = ? WHERE user_id = ?", [auth_key, user_id]);
        });

    };

    var handle = {
        reconnect: function() {
            storage_thing.each_param_sql("SELECT user_id from user WHERE auth_key = ? AND username = lower(?)", [data.auth_key, data.username]).then(function(result) {
                if (result.rows.length > 0) {
                    var user = {user_id: result.rows[0].user_id};
                    do_login(user, {reconnect: true});
                }
                else {
                    session.send('chatterbox', 'reconnect', {success: false, reason: "Fuck you"});
                }

            }, function(err) {
                session.send('chatterbox', 'reconnect', {success: false, reason: "Internal error."});
            });
        },
        login: function() {
            crepto.get_hashed_password(data.username, data.password).then(function(result) {

                storage_thing.each_param_sql("SELECT user_id from user WHERE username = lower(?) AND password = ?", [data.username, result.hashed_password]).then(function(db_result) {
                    if (db_result.rows.length > 0) {
                        do_login({user_id: result.user_id});
                    }
                    else {
                        session.send('login', 'login', {success: false, reason: "Fuck you (bad login)."});
                    }

                }, function() {
                    session.send('login', 'login', {success: false, reason: "Fuck you (DB error)."});
                });
            }).catch(function(error) {
                session.send('login', 'login', {success: false, reason: "Fuck you (bad login)."});
                console.log(error);
            })
        },
        login_with_auth_key: function() {
            storage_thing.each_param_sql("SELECT user_id from user WHERE auth_key = ? AND username = lower(?)", [data.auth_key, data.username]).then(function(result) {
                if (result.rows.length > 0) {
                    var user = {user_id: result.rows[0].user_id};
                    do_login(user);
                }
                else {
                    session.send('login', 'login', {success: false, reason: "Fuck you", auto_login: true});
                }

            }, function(err) {
                session.send('login', 'login', {success: false, reason: "Internal error.", auto_login: true});
            });
        },
        create_account: function() {
            if (data.username.length < 3 || data.password.length < 4) {
                session.send('login', 'create_account', {success: false, reason: "Username is 3-16 characters, password 4-64 characters."});
                return;
            }

            if (data.username.length > 16 || data.password.length > 64) {
                session.send('login', 'create_account', {success: false, reason: "Username is 3-16 characters, password 4-64 characters."});
                return;
            }

            var alpha_numeric_regex = /^[A-Za-z0-9_]+$/;

            if (alpha_numeric_regex.test(data.username) !== true || alpha_numeric_regex.test(data.password) !== true) {
                session.send('login', 'create_account', {success: false, reason: "Username and password must be alphanumeric."});
                return;
            }

            storage_thing.each_param_sql("SELECT user_id from user WHERE username = lower(?)", [data.username]).then(function(result) {
                if (result.rows.length > 0) {
                    session.send('login', 'create_account', {success: false, reason: "Username already exists!"});
                } else {
                    crepto.hash_password(data.password).then(function(result) {
                        var sql = 'INSERT INTO user (username, password, salty) VALUES (lower(?), ?, ?)';
                        var params = [data.username, result.hashed_password, result.salt];

                        storage_thing.run_param_sql(sql, params).then(function() {
                            session.send('login', 'create_account', {success: true});
                        }, function() {
                            session.send('login', 'create_account', {success: false, reason: "Internal error."});
                        });

                    }, function(err) {
                        console.log(err);
                        session.send('login', 'create_account', {success: false, reason: "Internal error."});
                    });
                }
            });

        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
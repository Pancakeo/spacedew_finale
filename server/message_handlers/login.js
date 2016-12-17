"use strict";

var crepto = require('../util/crepto');
var sessionator = require('../managers/sessionator');
var wiseau = require('../managers/wiseau');
var crypto = require('crypto');
var emu_list = require('../chat_commands/emu_list').get();
var mango = require('../managers/mango');
var uuid = require('node-uuid');
var star_wars = require('../stars/wupfindstar');

exports.requires_auth = false;
exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var lowercase_username = data.username && data.username.toLowerCase();

    var do_login = function(user, options) {
        options = Object.assign({
            reconnect: false
        }, options);

        session.login(data.username, user.user_id);
        session.profile.user_settings = user.user_settings;
        session.profile.rocket_league_rank = user.rl_max_rank;

        var auth_key = crypto.randomBytes(16).toString('hex');
        var user_id = user.user_id;

        session.auth_key = auth_key;

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
                lobby: wiseau.get_lobby(),
                emu_list: emu_list
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

        mango.get().then(function(db) {
            var users = db.collection('users');
            users.updateOne({user_id: user.user_id}, {$set: {auth_key: auth_key}}).then(function() {
                db.close();
            });
        });

        star_wars.update_user(user);
    };

    var handle = {
        reconnect: function() {
            mango.get().then(function(db) {
                var users = db.collection('users');

                users.findOne({auth_key: data.auth_key, username: lowercase_username}).then(function(user) {
                    db.close();

                    if (user == null) {
                        session.send('chatterbox', 'reconnect', {success: false, reason: "Fuck you"});
                    }
                    else {
                        do_login(user, {reconnect: true});
                    }
                });

            });
        },
        login: function() {
            mango.get().then(function(db) {
                var users = db.collection('users');
                users.findOne({username: lowercase_username}).then(function(user) {
                    db.close();

                    if (user == null) {
                        session.send('login', 'login', {success: false, reason: "Fuck you (bad login)."});
                        return;
                    }

                    crepto.get_hashed_password(user, data.password).then(function(result) {
                        if (user.password == result.hashed_password) {
                            do_login(user);
                        }
                        else {
                            session.send('login', 'login', {success: false, reason: "Fuck you (bad login)."});
                        }
                    });
                });
            });
        },
        login_with_auth_key: function() {
            mango.get().then(function(db) {
                var users = db.collection('users');
                users.findOne(
                    {
                        auth_key: data.auth_key,
                        username: lowercase_username
                    }).then(function(user) {
                        db.close();

                        if (user == null) {
                            session.send('login', 'login', {success: false, reason: "Fuck you", auto_login: true});
                            return;
                        }

                        do_login(user);
                    }
                );
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

            mango.get().then(function(db) {
                var users = db.collection('users');
                users.findOne({username: lowercase_username}).then(function(user) {
                    if (user != null) {
                        session.send('login', 'create_account', {success: false, reason: "Username already exists!"});
                        return;
                    }

                    crepto.hash_password(data.password).then(function(result) {
                        var new_user = {
                            username: lowercase_username,
                            user_id: uuid.v4(),
                            password: result.hashed_password,
                            salty: result.salt,
                            user_settings: {}
                        };

                        users.insertOne(new_user).then(function(result) {
                            db.close();
                            session.send('login', 'create_account', {success: true});
                        }).catch(function(err) {
                            session.send('login', 'create_account', {success: false, reason: "Internal error."});
                        });
                    }, function(err) {
                        console.log(err);
                        session.send('login', 'create_account', {success: false, reason: "Internal error."});
                    });
                });
            });

        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
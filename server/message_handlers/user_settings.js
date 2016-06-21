"use strict";
var sessionator = require('../managers/sessionator');
var storage_thing = require('../managers/storage_thing');
var crepto = require('../util/crepto');
var crypto = require('crypto');

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

            crepto.get_hashed_password(session.profile.username, data.current_pw).then(function(result) {
                storage_thing.each_param_sql('SELECT * from user WHERE user_id = ? AND password = ?', [result.user_id, result.hashed_password]).then(function(res) {
                    if (res.rows.length == 0) {
                        session.send('user_settings', 'change_password', {success: false, reason: "Current password is incorrect."});
                        return;
                    }

                    crepto.hash_password(data.new_pw).then(function(new_password) {
                        storage_thing.run_param_sql('UPDATE user SET password = ?, salty = ? WHERE user_id = ?', [new_password.hashed_password, new_password.salt, session.profile.user_id]).then(function(heh) {
                            session.send('user_settings', 'change_password', {success: true});
                            console.log(session.profile.username + " changed her password.");
                        })
                    });
                });
            });

        },
        outfit: function() {
            var user_id = session.profile.user_id;

            // TODO - add validations here!
            if (JSON.stringify(data.outfit).length > (1024 * 1024)) {
                console.error("Server settings exceeded limit!");
                return;
            }

            storage_thing.each_param_sql('SELECT * FROM user_settings WHERE user_id = ?', [user_id]).then(function(result) {

                if (result.rows.length == 0) {
                    var user_settings = {
                        outfit: data.outfit
                    };
                    storage_thing.run_param_sql('INSERT INTO user_settings (user_id, settings_json) VALUES (?, ?)', [user_id, JSON.stringify(user_settings)]);
                }
                else {
                    var user_settings = JSON.parse(result.rows[0].settings_json);
                    Object.assign(user_settings.outfit, data.outfit);

                    storage_thing.run_param_sql('UPDATE user_settings SET settings_json = ? WHERE user_id = ?', [JSON.stringify(user_settings), user_id]);
                }

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
            }, function(err) {
                console.log("whoops");
            });
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
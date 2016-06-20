"use strict";
var sessionator = require('../managers/sessionator');
var storage_thing = require('../managers/storage_thing');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var handle = {
        outfit: function() {
            var user_id = session.profile.user_id;
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
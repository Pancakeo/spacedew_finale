"use strict";

var crepto = require('../util/crepto');
var storage_thing = require('../managers/persistic');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var handle = {
        login: function() {
            crepto.get_hashed_password(data.username, data.password).then(function(result) {
                session.send('login', 'login', {success: true});
                session.profile.username = data.username;
                session.authenticated = true;
            }).catch(function(error) {
                session.send('login', 'login', {success: false, reason: "Fuck you"});
                console.log(error);
            })
        },
        create_account: function() {
            if (data.username.length < 4 || data.password.length < 4) {
                session.send('login', 'create_account', {success: false, reason: "Username and password must be 4+ characters."});
                return;
            }

            var alpha_numeric_regex = /[A-Z0-9]/i;
            if (alpha_numeric_regex.test(data.username) !== true || alpha_numeric_regex.test(data.password) !== true) {
                session.send('login', 'create_account', {success: false, reason: "Username and password must be alphanumeric."});
                return;
            }

            storage_thing.each_param_sql("SELECT user_id from user WHERE username = lower(?)", [data.username]).then(function(result) {
                if (result.rows.length > 0) {
                    session.send('login', 'create_account', {success: false, reason: "Already exists!"});
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
"use strict";

var crepto = require('../util/crepto');

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var handle = {
        login: function() {
            crepto.get_hashed_password(data.username, data.password).then(function(result) {
                session.send('login', 'login_attempt', {success: true});
                session.profile.username = data.username;
                session.authenticated = true;
            }).catch(function(error) {
                session.send('login', 'login_attempt', {success: false, reason: "Fuck you"});
                console.log(error);
            })
        }
    };

    if (handle[sub_type] != null) {
        handle[sub_type]();
    }

};
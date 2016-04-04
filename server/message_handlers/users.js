"use strict";
var event_bus = require(global.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var users = [];

exports.handle_message = function handle_message(session, message) {
    var sub_type = message.sub_type;
    var data = message.data;

    var handle = {
        users_list: function() {
            session.send('users', 'users_list', {users: users})
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

    // Should probably remove the user if they're already in the list.
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        if (user.username.toLowerCase() === username.toLowerCase()) {
            users.splice(i, 1);
            break;
        }
    }

    users.push({
        username: username,
        last_activity: Date.now()
    });
    
    sessionator.broadcast('users', 'users_list', {users: users})
});

event_bus.on('logout', function(params) {
    var username = params.username;
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        if (user.username.toLowerCase() === username.toLowerCase()) {
            users.splice(i, 1);
            break;
        }
    }

    sessionator.broadcast('chatterbox', 'users', {users: users});
});
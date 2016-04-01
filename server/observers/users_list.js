"use strict";
var event_bus = require(global.shared_root + '/event_bus');
var sessionator = require('../managers/sessionator');
var users = [];

event_bus.on('login', function(params) {
    var username = params.username;

    if (username == null) {
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

    sessionator.broadcast('chatterbox', 'users', {users: users})
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
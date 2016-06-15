module.exports = function($parent) {
    var known_users = {};

    get_page('users', function(page) {
        $parent.append(page.$container);

        page.listen('users_list', function(data) {
            var room_id = data.room_id;
            var $users = page.$("#users_list").empty();

            var logging_in = Object.keys(known_users).length == 0;
            var gone_to_a_better_place = Object.keys(known_users);

            data.users.map(function(user) {
                var nice_username = user.username.toLowerCase();

                if (!logging_in && known_users[nice_username] == null) {
                    page.emit('roams_the_earth', {username: user.username, room_id: room_id});
                }

                var idx = gone_to_a_better_place.indexOf(nice_username);
                if (idx >= 0) {
                    gone_to_a_better_place.splice(idx, 1);
                }

                known_users[nice_username] = user.username;

                var $user = $('<div class="user">' + user.username + '</div>');
                $users.append($user);
            });

            gone_to_a_better_place.forEach(function(user) {
                page.emit('has_gone_to_a_better_place', {username: known_users[user], room_id: room_id});
                delete known_users[user.toLowerCase()];
            });

            page.$("#users_list").append($users);
        });

        $(document).idle({
            onIdle: function() {
                page.send('idle', {idle: true});
            },
            onActive: function() {
                page.send('idle', {idle: false});
            },
            idle: 5000
        });

        var wait_for_app = setInterval(function() {
            if (app.ready) {
                page.send('users_list', {room_id: app.get_active_room(true)});
                clearInterval(wait_for_app);
            }
        }, 50);
    });

    return {};
};
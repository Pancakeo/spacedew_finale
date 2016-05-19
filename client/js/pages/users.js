module.exports = function($parent) {
    var known_users = {};

    get_page('users', function(page) {
        $parent.append(page.$container);

        page.listen('users_list', function(data) {
            var $users = page.$("#users_list").empty();

            var gone_to_a_better_place = Object.keys(known_users);

            data.users.map(function(user) {
                var nice_username = user.username.toLowerCase();

                if (known_users[nice_username] == null) {
                    page.emit('roams_the_earth', {username: user.username});
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
                page.emit('has_gone_to_a_better_place', {username: known_users[user]});
                delete known_users[user.toLowerCase()];
            });

            page.$("#users_list").append($users);
        });

        page.send('users_list', {});
    });

    return {};
};
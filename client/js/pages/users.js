module.exports = function($target) {
    var known_users = {};

    get_page('users', function(page) {
        $target.replaceWith(page.$container);

        var update_user_list_style = function() {
            page.$("#users_list .user").each(function() {
                var $user = $(this);

                var user_colors = {
                    bg_color: 'white',
                    fg_color: 'black',
                    font_family: 'Verdana',
                    font_size: '1.25em'
                };

                var user = $user.prop('user');
                var extend_from = app.world.user_settings[user.username] && app.world.user_settings[user.username].outfit && app.world.user_settings[user.username].outfit.user;

                $.extend(user_colors, extend_from);
                $user.css({
                    background: user_colors.bg_color,
                    color: user_colors.fg_color,
                    fontFamily: user_colors.font_family,
                    fontSize: user_colors.font_size + 'px'
                })
            });
        };

        page.listen('user_settings', function(data) {
            app.world.user_settings = data.user_settings;
            update_user_list_style();
        });

        page.listen('users_list', function(data) {
            var room_id = data.room_id;
            var $users = page.$("#users_list").empty();

            var logging_in = Object.keys(known_users).length == 0;
            var gone_to_a_better_place = Object.keys(known_users);

            data.users.sort(function(a, b) {
                var rank_a = a.rocket_league_rank || 0;
                var rank_b = b.rocket_league_rank || 0;

                return rank_b - rank_a;
            });

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
                var display_name = user.username;
                var $user = $('<div class="user"><span class="username">' + display_name + '</span></div>');

                if (user.idle == true) {
                    var duration = (user.idle_duration + (5000 * 60)) / 1000;
                    var unit = "s";

                    if (duration >= 60) {
                        duration /= 60;
                        unit = "m";
                    }

                    if (duration >= 60) {
                        duration /= 60;
                        unit = "h";
                    }

                    duration = duration.toFixed(0);

                    var $away = $('<div class="away">' + "Idle: " + duration + unit + "</div>");
                    $user.append($away);
                }

                if (user.ping == null) {
                    user.ping = '';
                }
                else {
                    user.ping += " ms";
                }

                var $ping = $('<div class="ping">' + user.ping + '</div>');
                $user.append($ping);

                $user.prop('user', user);
                $user.attr('title', user.username);

                if (user.idle) {
                    $user.addClass('idle');
                }

                var $star = $('<div class="woah_star"><img/></div>');

                if (user.rocket_league_rank != null) {
                    $star.find('img').attr('src', 'images/rl_ranks/' + user.rocket_league_rank + '.png');
                }
                else {
                    $star.find('img').attr('src', 'images/rl_ranks/0.png');
                }

                $user.prepend($star);
                $users.append($user);
            });

            gone_to_a_better_place.forEach(function(user) {
                page.emit('has_gone_to_a_better_place', {username: known_users[user], room_id: room_id});
                delete known_users[user.toLowerCase()];
            });

            update_user_list_style();
            page.$("#users_list").append($users);

            $users.contextMenu({
                selector: '.user',
                build: function($trigger, e) {
                    var username = $trigger.find('.username').text();

                    return {
                        callback: function(key, options) {
                            switch (key) {
                                case 'warn':
                                    var room_id = app.get_active_room(true);
                                    page.send('warn', {username: username, room_id: room_id});
                                    break;

                                default:
                                    break;
                            }

                        },
                        items: {
                            warn: {name: "Warn " + username, icon: "fa-exclamation-triangle"}
                        }
                    };
                }
            });
        });

        $(document).idle({
            onIdle: function() {
                page.send('idle', {idle: true});
            },
            onActive: function() {
                page.send('idle', {idle: false});
            },
            idle: 60000 * 5 // 5 minutes
        });

        // I'm sure this is fine!
        var wait_for_app = setInterval(function() {
            if (app.ready) {
                page.send('sync', {room_id: app.get_active_room(true)});
                clearInterval(wait_for_app);
            }
        }, 50);
    });

    return {};
};
module.exports = function($target) {
    var displayed_users_once = false; // for mobile
    var default_emus = require('../app/default_emus');

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
            if (data.user_settings[app.profile.username] && data.user_settings[app.profile.username].outfit && data.user_settings[app.profile.username].outfit.holy_cow) {
                app.holy_cow = data.user_settings[app.profile.username].outfit.holy_cow;
            }
            else {
                app.holy_cow = default_emus;
            }

            app.world.user_settings = data.user_settings;
            update_user_list_style();
        });

        page.user_list_data = null;
        app.render_users_list = function(data) {
            if (data != null) {
                page.user_list_data = data;
            }
            else if (page.user_list_data == null) {
                return;
            }
            else {
                data = page.user_list_data;
            }

            var $users = page.$("#users_list").empty();
            var users = data.users_and_rooms.users;

            users.sort(function(a, b) {
                var rank_a = a.rocket_league_rank || 0;
                var rank_b = b.rocket_league_rank || 0;

                return rank_b - rank_a;
            });

            var rooms = data.users_and_rooms.rooms;

            users.filter(function(user) {
                var room_id = app.get_active_room(true);

                var in_room = rooms[room_id] && rooms[room_id].users.some(function(room_user) {
                        return room_user.username == user.username;
                    });


                return in_room;
            }).map(function(user) {
                var nice_username = user.username.toLowerCase();
                // var display_name = user.username;
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

                var ping = '';
                if (user.ping != null) {
                    ping = user.ping + ' ms';
                }

                var $ping = $('<div class="ping">' + ping + '</div>');
                $user.append($ping);

                $user.prop('user', user);
                $user.attr('title', user.username);

                if (user.idle) {
                    $user.addClass('idle');
                }

                var $star = $('<div class="woah_star"><img/></div>');

                if (user.rocket_league_rank != null) {
                    $star.find('img').attr('src', 'images/rl_ranks/s4-' + user.rocket_league_rank + '.png');
                }
                else {
                    $star.find('img').css({visibility: 'hidden'});
                }

                $user.prepend($star);

                if (user.warning_level > 0) {
                    var $warn_bar = $("<progress title='Warning Level: " + user.warning_level + "%' class='warn_bar' max='100'/>");
                    $warn_bar.attr('value', user.warning_level);
                    $user.append($warn_bar);
                }

                $users.append($user);
            });

            update_user_list_style();
            page.$("#users_list").append($users);

            $users.contextMenu({
                selector: '.user',
                build: function($trigger, e) {
                    var username = $trigger.find('.username').text();
                    var user = $trigger.prop('user');

                    return {
                        callback: function(key, options) {
                            switch (key) {
                                case 'warn':
                                    page.send('warn', {username: username});
                                    break;

                                case 'super_warn':
                                    page.send('warn', {username: username, super_warn: true});
                                    break;

                                case 'view_rl_page':
                                    window.open('https://rocketleague.tracker.network/profile/steam/' + user.steam_id, '_blank');
                                    break;

                                default:
                                    break;
                            }

                        },
                        items: {
                            warn: {name: "Warn " + username, icon: "fa-exclamation-triangle"},
                            super_warn: {name: "REALLY warn " + username, icon: "fa-bomb"},
                            view_rl_page: {
                                name: 'View Rocket League Tracker', icon: 'fa-rocket',
                                disabled: function() {
                                    return user.steam_id == null;
                                }
                            }
                        }
                    };
                }
            });

            if (app.is_mobile && !displayed_users_once) {
                displayed_users_once = true;
                var woboy_users = data.users.map(function(user) {
                    return user.username;
                }).join(', ');

                app.append_system("Users logged in: " + woboy_users, {color: 'green'});
            }
        };

        page.listen('users_list', function(data) {
            app.render_users_list(data);
        });

        $(document).idle({
            onIdle: function() {
                page.send('idle', {idle: true});
            },
            onActive: function() {
                page.send('idle', {idle: false});
            },
            idle: 60000 * 5, // 5 minutes
            recurIdleCall: true
        });

        // I'm sure this is fine!
        var wait_for_app = setInterval(function() {
            if (app.ready) {
                page.send('sync', {room_id: app.get_active_room(true)});
                clearInterval(wait_for_app);
                app.users_pane_loaded();
            }
        }, 50);
    });

    return {};
};
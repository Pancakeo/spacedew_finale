module.exports = function(options) {
    var ws = require('../app/wupsocket');
    var event_bus = app.event_bus;

    get_page('yownet', {popup: true}, function(page) {
        $('body').append(page.$container);

        page.$('#start_game').button().on('click', function() {
            page.send('start_game', {});
        });

        options = $.extend({
            game_name: 'Game Name',
            instance_id: null,
            invite_user: null,
            room_id: null,
            usernames: []
        }, window.woboy);

        if (options.instance_id) {
            page.instance_id = options.instance_id;
            page.send('create_game', {instance_id: options.instance_id, game_name: options.game_name, invite_user: options.invite_user});
        }
        else {
            page.send('join_game', {room_id: options.room_id});
            page.$("button").button({disabled: true});
        }

        page.$("#game_type").on('change', function() {
            page.send('set_game_key', {game_key: $(this).val()})
        });

        page.listen('update_game', function(data) {
            page.game = data.game;
            page.$("#game_type").val(page.game.game_key);
        });

        page.listen('start_game', function(data) {
            page.$container.empty();

            var handlers = {
                tick_tack: function() {
                    require('./tick_tack')({room_id: page.room_id});
                },
                c4: function() {
                    require('./c4')({room_id: page.room_id});
                },
                crabble: function() {
                    require('./crabble')({room_id: page.room_id});
                },
                spacedew: function() {
                    require('./spacedew')({room_id: page.room_id});
                }
            };

            handlers[page.game.game_key] && handlers[page.game.game_key]();
        });

        page.listen('system', function(data) {
            var $chat = $('<div class="message_wrapper"/>');
            var $message = $('<div class="message">' + data.message + '</div>');
            $message.css({color: 'green'});
            $chat.append($message);

            var $messages = page.$("#messages");
            $messages.append($chat);

            $messages.scrollTop($messages[0].scrollHeight);
        });

        page.listen('chat', function(data) {
            var $chat = $('<div class="message_wrapper"/>');
            var $user = $('<div class="username">' + data.username + ': </div>');
            var $message = $('<div class="message">' + data.message + '</div>');
            $chat.append($user, $message);

            var $messages = page.$("#messages");
            $messages.append($chat);

            $messages.scrollTop($messages[0].scrollHeight);
        });

        page.listen('add_bot', function(data) {
            var $tbody = page.$("#players tbody");
            var $player_row = page.get_template('player_row');
            $player_row.attr('bot_id', data.id);
            $player_row.find('#player_name').val(data.name);
            $player_row.find('#is_observer').attr('disabled', true);
            $player_row.find('#player_eject').show().button().prop('bot_id', data.id);
            $tbody.append($player_row);
        });

        page.listen('remove_bot', function(data) {
            page.$("#players tbody tr[bot_id='" + data.id + "']").remove();
        });

        page.listen('add_player', function(data) {
            var $tbody = page.$("#players tbody");
            var $player_row = page.get_template('player_row');
            // $player_row.attr('bot_id', data.id);
            $player_row.find('#player_name').val(data.name);
            $tbody.append($player_row);
        });

        page.listen('rename_game', function(data) {
            page.$("#game_name").text(data.game_name);
        });

        page.listen('game_ready', function(data) {
            page.game = data.game;

            page.always_send = {
                room_id: page.game.room_id
            };

            page.room_id = page.game.room_id;
            page.set_ws_room_id(); // update the wupsocket's knowledge of this popup.

            var $tbody = page.$("#players tbody");
            page.game.players.forEach(function(p) {
                var $player_row = page.get_template('player_row');
                $player_row.find('#player_name').val(p.name);
                $player_row.find('#is_observer').prop('checked', p.observer);
                $tbody.append($player_row);
            });

            if (localStorage.fast_crab) {
                page.$("#add_bot").click();
            }
        });

        page.$("#players").on('click', '#player_eject', function() {
            page.send('remove_bot', {id: $(this).prop('bot_id')});
        });

        page.$("#invite_to_game").button().on('click', function() {
            var $users = $('<table><tbody></tbody></table>');
            var $user = $('<tr><td id="username"></td><td><button>Invite?</button></td></tr>');

            $users.on('click', 'button', function() {
                var username = $(this).prop('username');
                $(this).button('disable');

                page.send('sorry_jimmy', {username: username, room_id: page.room_id});
            });

            options.usernames.forEach(function(username) {
                $user.find('#username').text(username);
                $user.find('button').prop('username', username);
                $users.find('tbody').append($user);
                $user = $user.clone();
            });

            $users.find('button').button();

            $users.dialog({
                title: 'Invite Users!',
                modal: true,
                buttons: {
                    'Close': function() {
                        $(this).dialog('close');
                    }
                }
            })
        });

        page.$("#add_bot").button().on('click', function() {
            page.send('add_bot', {});

            if (localStorage.fast_crab) {
                page.$("#start_game").click();
            }
        });

        page.$("#game_name").text(options.game_name);

        page.$("#set_game_name").button().on('click', function() {
            page.toolio.prompt('Set Game Name', page.$("#game_name").text(), function(val) {
                if (val) {
                    val = val.trim();
                    if (val.length > 0) {
                        page.send('set_game_name', {game_name: val});
                    }
                }
            });
        });

        page.$("#composer").on('keypress', function(e) {
            if (e.which == 13) {
                var message = $(this).val().trim();
                page.$("#composer").val('');

                if (message.length > 0) {
                    page.send('chat', {message: message});
                }
            }
        });
    });

    setInterval(function() {
        if (!window.opener || window.opener.closed) {
            window.close();
        }
    }, 100);

    return {};
};
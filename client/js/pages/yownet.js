module.exports = function(options) {
    options = $.extend(true, {
        game_name: 'Game Name',
        game_type: 'Game Type',
        max_players: 2,
        join_game: null,
        on_start: () => {
        },
        on_open: () => {
        }
    }, options);

    // For testing:
    if (app.profile.username == null) {
        app.profile.username = localStorage.username || 'HEH';
    }

    let ws = require('../app/wupsocket');
    let event_bus = app.event_bus;

    get_page('yownet', function(page) {
        page.instance_id = page.toolio.generate_id();

        page.$("#players").on('click', '#player_eject', function() {
            page.send('remove_bot', {id: $(this).prop('bot_id')});
        });

        page.listen('event', function(data) {
            if (data.instance_id != page.instance_id && data.room_id != page.room_id) {
                return;
            }

            let event_handlers = {
                start_game: function() {
                    page.$container.dialog('close');

                    switch (page.game.game_type) {
                        case 'Tick Tack':
                            app.toolio.confirm("Popup", "Hit OK to Join Game Thing Popup", function() {
                                let popup = window.open('index.html?wup=tick_tack&room_id=' + page.room_id, '_blank', 'width=1300,height=830,left=200,top=200');
                                page.ws.register_popup('tick_tack', page.room_id, popup);
                            });
                            break;

                        case 'Crabble':
                            app.toolio.confirm("Popup", "Hit OK to Join Game Thing Popup", function() {
                                let popup = window.open('index.html?wup=crabble&room_id=' + page.room_id, '_blank', 'width=1300,height=830,left=100,top=100');
                                page.ws.register_popup('crabble', page.room_id, popup);
                            });
                            break;
                    }
                },
                system: function() {
                    var $chat = $('<div class="message_wrapper"/>');
                    var $message = $('<div class="message">' + data.message + '</div>');
                    $message.css({color: 'green'});
                    $chat.append($message);

                    let $messages = page.$("#messages");
                    $messages.append($chat);

                    $messages.scrollTop($messages[0].scrollHeight);
                },
                chat: function() {
                    var $chat = $('<div class="message_wrapper"/>');
                    var $user = $('<div class="username">' + data.username + ': </div>');
                    var $message = $('<div class="message">' + data.message + '</div>');
                    $chat.append($user, $message);

                    let $messages = page.$("#messages");
                    $messages.append($chat);

                    $messages.scrollTop($messages[0].scrollHeight);
                },
                add_bot: function() {
                    let $tbody = page.$("#players tbody");
                    let $player_row = page.get_template('player_row');
                    $player_row.attr('bot_id', data.id);
                    $player_row.find('#player_name').val(data.name);
                    $player_row.find('#is_observer').attr('disabled', true);
                    $player_row.find('#player_eject').show().button().prop('bot_id', data.id);
                    $tbody.append($player_row);
                },
                remove_bot: function() {
                    page.$("#players tbody tr[bot_id='" + data.id + "']").remove();
                },
                add_player: function() {
                    let $tbody = page.$("#players tbody");
                    let $player_row = page.get_template('player_row');
                    // $player_row.attr('bot_id', data.id);
                    $player_row.find('#player_name').val(data.name);
                    $tbody.append($player_row);
                },
                rename_game: function() {
                    page.$("#game_name").text(data.game_name);
                },
                game_ready: function() {
                    page.always_send = {
                        room_id: data.room_id
                    };

                    page.room_id = data.room_id;
                    page.game = data.game;

                    let buttons = {};
                    if (!options.join_game) {
                        buttons = {
                            'Start': function() {
                                page.send('start_game', {});
                            },
                            'Cancel': function() {
                                $(this).dialog('close');
                            }
                        };
                    }

                    page.$container.dialog({
                        title: 'Yownet: New ' + options.game_type + ' Game',
                        modal: true,
                        width: 800,
                        open: function() {
                            page.$("#composer").focus();
                            options.on_open(page);

                            if (options.join_game) {
                                page.$("button").button('disable');
                            }

                        },
                        close: function() {
                            page.destroy();
                        },
                        buttons: buttons
                    });

                    let $tbody = page.$("#players tbody");
                    page.game.players.forEach(function(p) {
                        let $player_row = page.get_template('player_row');
                        $player_row.find('#player_name').val(p.name);
                        $player_row.find('#is_observer').prop('checked', p.observer);
                        $tbody.append($player_row);
                    })
                }
            };

            if (typeof(event_handlers[data.type]) == "function") {
                event_handlers[data.type]();
            }
        });

        page.$("#invite_to_game").button().on('click', function() {
            let $users = $('<table><tbody></tbody></table>');
            let $user = $('<tr><td id="username"></td><td><button>Invite?</button></td></tr>');

            $users.on('click', 'button', function() {
                let username = $(this).prop('username');
                $(this).button('disable');

                page.send('sorry_jimmy', {username: username, room_id: page.room_id});
            });


            if (app.user_list_data) {
                app.user_list_data.users_and_rooms.users.map(function(entry) {
                    return entry.username;
                }).filter(function(username) {
                    return app.profile.username != username;
                }).forEach(function(username) {
                    $user.find('#username').text(username);
                    $user.find('button').prop('username', username);
                    $users.find('tbody').append($user);
                    $user = $user.clone();
                });
            }

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
        });

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
                let message = $(this).val().trim();
                page.$("#composer").val('');

                if (message.length > 0) {
                    page.send('chat', {message: message});
                }
            }
        });

        if (options.join_game) {
            page.room_id = options.join_game;
            page.send('join_game', {room_id: options.join_game});
        }
        else {
            page.send('create_game', {instance_id: page.instance_id, game_type: options.game_type, game_name: options.game_name});
            page.$("#game_name").text(options.game_name);
        }

    });

    return {};
};
module.exports = function(options) {
    options = $.extend(true, {
        game_name: 'Game Name',
        game_type: 'Game Type',
        max_players: 2,
        on_start: () => {},
        on_open: () => {}
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
            if (data.instance_id != page.instance_id && data.room_id != page.game_id) {
                return;
            }

            let event_handlers = {
                start_game: function() {
                    options.on_start({game_id: page.game_id});
                    page.$container.dialog('close');
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
                    let $team_select = $('<select id="player_team"/>');
                    data.teams.forEach(function(team, idx) {
                        let $opt = $('<option>' + team + '</option>');
                        $team_select.append($opt);
                    });

                    let $tbody = page.$("#players tbody");
                    let $player_row = page.get_template('player_row');
                    $player_row.attr('bot_id', data.id);
                    $player_row.find('#player_name').val(data.name);
                    $player_row.find('#player_team').replaceWith($team_select);
                    $player_row.find('#player_eject').show().button().prop('bot_id', data.id);

                    $player_row.find('#player_team').val(data.team);
                    $tbody.append($player_row);
                },
                remove_bot: function() {
                    page.$("#players tbody tr[bot_id='" + data.id + "']").remove();
                },
                rename_game: function() {
                    page.$("#game_name").text(data.game_name);
                },
                game_ready: function() {
                    page.always_send = {
                        game_id: data.game_id
                    };

                    page.game_id = data.game_id;

                    page.$container.dialog({
                        title: 'Yownet: New ' + options.game_type + ' Game',
                        modal: true,
                        width: 800,
                        open: function() {
                            page.$("#composer").focus();
                            options.on_open(page);
                        },
                        close: function() {
                            page.destroy();
                        },
                        buttons: {
                            'Start': function() {
                                page.send('start_game', {});
                            },
                            'Cancel': function() {
                                $(this).dialog('close');
                            }
                        }
                    });

                    let $team_select = $('<select id="player_team"/>');
                    data.teams.forEach(function(team, idx) {
                        let $opt = $('<option>' + team + '</option>');
                        $team_select.append($opt);
                    });

                    let $tbody = page.$("#players tbody");
                    data.players.forEach(function(p) {
                        let $player_row = page.get_template('player_row');
                        $player_row.find('#player_name').val(p.name);
                        $player_row.find('#player_team').replaceWith($team_select);

                        $player_row.find('#player_team').val(p.team);
                        $tbody.append($player_row);
                    })
                }
            };

            if (typeof(event_handlers[data.type]) == "function") {
                event_handlers[data.type]();
            }
        });

        page.$("#invite_to_game").button().on('click', function() {

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

        let create_game = function() {
            page.send('create_game', {username: app.profile.username, instance_id: page.instance_id, game_type: options.game_type, game_name: options.game_name});
        };

        create_game();

        page.$("#game_name").text(options.game_name);
    });

    return {};
};
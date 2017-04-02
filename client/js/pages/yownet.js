module.exports = function(options) {
    options = $.extend({
        min_players: 2,
        max_players: 8,
        game_name: 'wupfindgame',
        game_type: null,
        on_start: function() {

        }
    }, options);

    // For testing:
    if (app.profile.username == null) {
        app.profile.username = localStorage.username || 'HEH';
    }

    var ws = require('../app/wupsocket');
    var event_bus = app.event_bus;

    get_page('yownet', function(page) {
        page.$("#tabs").tabs();
        page.$("button").button();

        page.$("#composer").on('keypress', function(e) {
            if (e.which == 13) {
                var mess = page.$("#composer").text().trim();
                if (mess.length > 0) {
                    page.send('chat', {message: mess, game_id: page.game.game_id})
                }

                page.$("#composer").text('');
                return false;
            }
        });

        page.listen('chat', function(data) {
            var $chat = $('<div class="message_wrapper"/>');
            var $user = $('<div class="username">' + data.username + ': </div>');
            var $message = $('<div class="message">' + data.message + '</div>');

            $chat.append($user, $message);
            page.$("#messages").append($chat);
        });

        var host_stuff = {
            game_id: null,
            max_players: null,
            game_name: null
        };

        var $parent = $('body');
        $parent.append(page.$container);

        var on_ready = function() {
            $wait_dialog && $wait_dialog.dialog('close');

            if (localStorage.is_local_dev && localStorage.fast_crab) {
                create_game();
            }

            page.games_list_poller = setInterval(function() {
                page.send('games_list', {});
            }, 2500);

            page.send('games_list', {});
        };

        if (!ws.is_connected()) {
            var $wait_dialog = $("<div>Connecting to server...</div>").dialog({
                modal: true,
                closeOnEscape: false,
                title: "Waiting is"
            });

            ws.connect();
        }
        else {
            on_ready();
        }

        event_bus.on('ws.connect', function() {
            on_ready();
        });

        page.$("#game_name").val(options.game_name);
        page.$("#game_type").val(options.game_type);

        if (options.min_players == options.max_players) {
            page.$("#max_players").val(options.max_players).attr('readonly', 'readonly');
        }
        else {
            page.$("#max_players").spinner({
                min: options.min_players,
                max: options.max_players,
                change: function(event, ui) {
                    if (!$(this).spinner('isValid')) {
                        $(this).val(2);
                    }
                }
            }).val(2);
        }

        page.$("#start_game").on('click', function() {
            page.$container.remove();
            options.on_start(host_stuff);
        });

        var create_game = function() {
            var game_params = {
                username: app.profile.username,
                game_type: page.$("#game_type").val(),
                game_name: page.$("#game_name").val().trim(),
                max_players: page.$("#max_players").val().trim()
            };

            if (game_params.game_name.length == 0) {
                page.alert('Oops', 'Must provide game name.');
                return;
            }

            page.$wait_dialog = $("<div>Creating game...</div>").dialog({
                modal: true,
                closeOnEscape: false,
                title: "Waiting is"
            });

            page.$("#pre_game").hide();
            page.$("#game_lobby").show();
            page.send('create_game', game_params);
        };

        var join_game = function(game_id) {
            page.$wait_dialog = $("<div>Joining game...</div>").dialog({
                modal: true,
                closeOnEscape: false,
                title: "Waiting is"
            });

            page.send('join_game', {game_id: game_id, username: app.profile.username});
        };

        page.$("#create_game_action").on('click', function() {
            create_game();
        });


        page.$("#games_list tbody").on('click', 'tr:not(.help)', function() {
            $(this).siblings('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        });

        page.$("#join_game_action").on('click', function() {
            var $selected = page.$("#games_list tbody tr.selected");
            var game_id = $selected.attr('game_id');

            if (game_id) {
                join_game(game_id);
            }
        });

        page.listen('create_game', function(data) {
            page.$wait_dialog && page.$wait_dialog.dialog('close');
            host_stuff = data;
            page.game = data;
            page.$("[field_name='game_name']").text(host_stuff.game_name);
            page.$("[field_name='current_players']").text(host_stuff.players.length);
            page.$("[field_name='max_players']").text(host_stuff.max_players);

            page.$("#current_players").empty();

            host_stuff.players.forEach(function(p) {
                page.$("#current_players").append('<div>' + p + '</div>');
            });

            page.$("#messages").append('<div>' + host_stuff.players[0] + ' created the game.</div>');

            if (localStorage.is_local_dev && localStorage.fast_crab) {
                page.$("#start_game").click();
            }

            page.$("#composer").focus();
        });

        page.listen('games_list', function(data) {
            var $selected_row = page.$("#games_list tbody tr.selected");

            var $games_list = page.$("#games_list tbody");
            $games_list.empty();

            data.games_list.forEach(function(g) {
                var $game_row = page.get_template('game_row');
                $game_row.attr('game_id', g.game_id);
                $game_row.find('[field_name="type"]').text(g.game_type);
                $game_row.find('[field_name="name"]').text(g.game_name);
                $game_row.find('[field_name="host"]').text(g.host);
                $game_row.find('[field_name="players"]').text(g.players.length + ' / ' + g.max_players);

                $games_list.append($game_row);
            });

            if (data.games_list.length == 0) {
                $games_list.append('<tr class="help"><td colspan="4">No games :(</td></tr>');
            }
            else {
                var game_id = $selected_row.attr('game_id');
                if (game_id) {
                    $games_list.find('tr[game_id="' + game_id + '"]').click();
                }
            }
        });

        page.listen('join_game', function(data) {
            page.$wait_dialog && page.$wait_dialog.dialog('close');

            if (!data.success) {
                page.alert("Oops", "Failed to join game.");
                return;
            }

            var game = data.game;
            page.game = game;

            page.$("[field_name='game_name']").text(game.game_name);
            page.$("[field_name='current_players']").text(game.players.length);
            page.$("[field_name='max_players']").text(game.max_players);

            page.$("#current_players").empty();

            game.players.forEach(function(p) {
                page.$("#current_players").append('<div>' + p + '</div>');
            });

            page.$("#pre_game").hide();
            page.$("#game_lobby").show();
            page.$("#composer").focus();
        });

    });

    return {};
};
module.exports = function(options) {
    options = $.extend(true, {
        game_name: 'Game Name',
        game_type: 'Game Type',
        teams: [{name: 'Red'}, {name: 'Blue'}]
    }, options);

    // For testing:
    if (app.profile.username == null) {
        app.profile.username = localStorage.username || 'HEH';
    }

    let ws = require('../app/wupsocket');
    let event_bus = app.event_bus;

    get_page('yownet', function(page) {

        page.listen('game_ready', function(data) {
            page.always_send = {
                game_id: data.game_id
            };

            page.$container.dialog({
                title: 'Yownet: New ' + options.game_type + ' Game',
                modal: true,
                width: 800,
                open: function() {
                    page.$("#composer").focus();
                },
                close: function() {
                    app.toolio.alert('Game cancelled');
                },
                buttons: {
                    'Start': function() {

                    },
                    'Cancel': function() {

                    }
                }
            });
        });

        options.teams.forEach(function(team) {
            let $team = page.get_template('team_row');
            $team.find('.team_name').text(team.name);
            page.$("#teams").append($team);
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

        page.listen('chat', function(data) {
            var $chat = $('<div class="message_wrapper"/>');
            var $user = $('<div class="username">' + data.username + ': </div>');
            var $message = $('<div class="message">' + data.message + '</div>');
            $chat.append($user, $message);
            page.$("#messages").append($chat);
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
            page.send('create_game', {username: app.profile.username});
        };

        if (!ws.is_connected()) {
            let $wait_dialog = $("<div>Connecting to server...</div>").dialog({
                modal: true,
                closeOnEscape: false,
                title: "Waiting is"
            });

            ws.connect();
        }
        else {
            create_game();
        }

        event_bus.on('ws.connect', function() {
            create_game();
        });

        page.$("#game_name").text(options.game_name);
    });

    return {};
};
/*
 Ideas: Replace drag and drop with sortable (for forming words) and then click + place for going to board.

 */
module.exports = function() {

    var ws = require('../app/wupsocket');
    var event_bus = require('../../../shared/event_bus');

    get_page('crabble', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        var crabble_thing = require('../crabble/crabble_helper')(page);
        var host_stuff = {
            game_id: null
        };

        var my_stuff = {};
        var world = {};

        page.listen('create_game', function(data) {
            host_stuff = data;

            if (localStorage.is_local_dev) {
                start_game();
            }
        });

        page.listen('setup', function(data) {
            my_stuff = data.my_stuff;
            world = data.world;

            var $players = page.$("#players_list");
            $players.empty();

            for (var name in world) {
                var p = world[name];
                $players.append('<div class="player">' + p.name + ' (' + p.score + ')</div>');
            }

            $players.find('.player').first().addClass('active');

            page.$("#board").show();
            crabble_thing.setup_game(my_stuff, world);
        });

        page.$("#thing").tabs();
        page.$("#board").hide();
        page.$("#wup").hide();

        page.$("#game_name").val("Sparky");

        page.$("#players").spinner({
            min: 2,
            max: 4,
            change: function(event, ui) {
                if (!$(this).spinner('isValid')) {
                    $(this).val(2);
                }
            }
        }).val(2);

        if (!ws.is_connected()) {
            var $wait_dialog = $("<div>Connecting to server...</div>").dialog({
                modal: true,
                closeOnEscape: false,
                title: "Waiting is"
            });

            ws.connect();
        }

        event_bus.on('ws.connect', function() {
            $wait_dialog && $wait_dialog.dialog('close');
            page.$("#wup").show();

            if (localStorage.is_local_dev) {
                create_game();
            }
        });

        var create_game = function() {
            var game_params = {
                username: localStorage.username,
                game_name: page.$("#game_name").val()
            };

            page.$("#wup").hide();
            page.send('create_game', game_params);
        };

        var start_game = function() {
            page.send('start_game', host_stuff);
        };

        var join_game = function() {

        };

        page.$("#create_game_action").on('click', function() {
            create_game();
        });

    });

    return {};
};
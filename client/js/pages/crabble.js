import '../../less/crabble.less';

export default function() {
    var ws = require('../app/wupsocket');
    var event_bus = require('../../../shared/event_bus');

    get_page('crabble', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        var crabble_thing = require('../crabble/crabble_helper')(page);

        var host_stuff = {
            game_id: null,
            max_players: null,
            game_name: null
        };
        page.listen('end_turn', function(data) {
            // console.log(data);
        });

        page.listen('current_turn', function(data) {
            crabble_thing.hot_seat(data);
        });

        page.listen('setup', function(data) {
            page.$("#game_lobby").hide();
            var $players = page.$("#players_list tbody");
            $players.empty();

            data.world.forEach(function(p) {
                var $row = page.get_template('player_row');
                $row.find('td[field_name="player_name"]').text(p.name);
                $row.find('td[field_name="player_score"]').text(p.score);
                $row.attr('player_name', p.name);
                $players.append($row);
            });

            console.log(data);
            page.$("#game_wrapper").show();
            crabble_thing.setup_game(data);
            crabble_thing.update_letters(data.my_stuff.letters);
        });

        page.$("#game_wrapper").hide();
    });

    return {};
};
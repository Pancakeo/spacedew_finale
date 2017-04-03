module.exports = function(options) {

    options = $.extend({
        game_id: null
    }, options);

    get_page('tick_tack', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        if (!options.game_id) {
            let yownet = require('./yownet')({
                max_players: 2,
                game_type: 'Tick Tack',
                game_name: 'Ticking Time Bomb',

                on_start: function() {
                    // Enter game.
                }
            });
        }
        else {
            // Enter game.
        }
    });

    return {};
};
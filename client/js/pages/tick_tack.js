module.exports = function() {

    get_page('tick_tack', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        console.log(page.$container);

        var yownet = require('./yownet')({
            max_players: 2,
            game_type: 'Tick Tack',
            game_name: 'Ticking Time Bomb',
            on_start: function(host_stuff) {
                page.$("#tick_tack").show();
            }
        });
    });

    return {};
};
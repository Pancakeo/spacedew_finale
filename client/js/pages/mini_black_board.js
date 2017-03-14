module.exports = function($target) {
    var canvas_handler = require('../../../shared/canvas_handler');

    get_page('mini_black_board', function(page) {
        $target.replaceWith(page.$container);

        var canvas = page.$("#mini_black_board_canvas")[0];
        var ctx = canvas.getContext('2d');
        ctx.scale(0.2, 0.2);

        var ch = canvas_handler(ctx);

        page.$("#mini_black_board_canvas").on('click', function() {
            app.open_black_board();
        });

        var pass_it_up = function(data) {
            if (app.black_board && app.black_board.closed != true) {
                app.black_board.postMessage(data, app.domain);
            }
        };

        page.peepy('black_board.load', function(data) {
            data.type = 'load';
            pass_it_up(data);

            ch.handle_thing({type: 'colorful_clear', data: {color: data.bg_color, nuke: true}});

            data.data.forEach(function(thing) {
                ch.handle_thing(thing);
            });

        });

        page.peepy('black_board.draw', function(info) {
            pass_it_up(info);
            ch.handle_thing(info);
        });

        // Not hacky at all.
        if (app.is_mobile) {
            $("#mini_black_board").hide();
            $("#users").attr('style', 'height: 100%;');
        }

    });
};
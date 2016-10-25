module.exports = function($target) {
    get_page('mini_black_board', function(page) {
        $target.replaceWith(page.$container);

        var ctx = page.$("#mini_black_board_canvas")[0].getContext('2d');

        page.$("#mini_black_board_canvas").on('click', function() {
            app.open_black_board();
        });

        page.peepy('black_board.draw', function(info) {
            var data = info.data;

            switch (info.type) {
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(data.start_x, data.start_x);
                    ctx.lineTo(data.end_x, data.end_y);
                    ctx.stroke();
                    break;
            }
        });

        // Not hacky at all.
        var user_agent = navigator.userAgent.toLowerCase();
        var is_android = user_agent.indexOf("android") > -1;
        if (is_android) {
            $("#mini_black_board").hide();
            $("#users").attr('style', 'height: 100%;');
        }

    });
};
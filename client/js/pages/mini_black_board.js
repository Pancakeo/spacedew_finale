module.exports = function($target) {
    get_page('mini_black_board', function(page) {
        $target.replaceWith(page.$container);

        var ctx = page.$("#mini_black_board_canvas")[0].getContext('2d');
        ctx.scale(0.2, 0.2);

        page.$("#mini_black_board_canvas").on('click', function() {
            app.open_black_board();
        });

        page.peepy('black_board.draw', function(info) {
            var data = info.data;

            switch (info.type) {
                case 'line':
                    ctx.beginPath();
                    var r = 0, g = 0, b = 0, a = 255;
                    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
                    ctx.moveTo(data.start_x, data.start_y);
                    ctx.lineTo(data.end_x, data.end_y);
                    ctx.stroke();
                    break;

                case 'rekt':
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(" + data.r + "," + data.g + "," + data.b + "," + (data.a / 255) + ")";
                    ctx.fillRect(data.x, data.y, data.size, data.size);
                    ctx.stroke();
                    break;

                case 'great_clear':
                    // Blame?
                    ctx.clearRect(0, 0, 1280, 720);
                    break;

                default:
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
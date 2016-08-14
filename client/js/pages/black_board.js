module.exports = function() {
    get_page('black_board', function(page) {
        $('body').append(page.$container);

        var ctx = page.$("#black_board_canvas")[0].getContext('2d');
        ctx.strokeStyle = "#FF0000";

        var resize_canvas = function() {
            var height = $(window).height() - 50;
            var width = $(window).width();
            page.$("#black_board_canvas").attr({width: width, height: height});
        };

        resize_canvas();

        $(window).on('resize', resize_canvas);

        page.$("#black_board_canvas").on('click', function(e) {
            console.log(page.toolio);
            var start_x = page.toolio.random(0, 700);
            var start_y = page.toolio.random(0, 500);
            var end_x = page.toolio.random(0, 700);
            var end_y = page.toolio.random(0, 500);

            ctx.beginPath();
            ctx.moveTo(start_x, start_y);
            ctx.lineTo(end_x, end_y);
            ctx.stroke();
        });

        setInterval(function() {
            if (!window.opener || window.opener.closed) {
                window.close();
            }

        }, 100);
    });
};
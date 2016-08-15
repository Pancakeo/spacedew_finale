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

        var send_thing = function(type, data) {
            var domain = window.location.protocol + '//' + window.location.hostname;
            if (window.location.port != 80) {
                domain += ":" + window.location.port
            }

            var message = {type: type, data: data};
            window.opener.postMessage(message, domain);
        };

        page.$("#black_board_canvas").on('click', function(e) {
            var line = {
                start_x: page.toolio.random(0, 700),
                start_y: page.toolio.random(0, 500),
                end_x: page.toolio.random(0, 700),
                end_y: page.toolio.random(0, 500)
            };

            ctx.beginPath();
            ctx.moveTo(line.start_x, line.start_x);
            ctx.lineTo(line.end_x, line.end_y);
            ctx.stroke();

            send_thing('line', line);
        });

        setInterval(function() {
            if (!window.opener || window.opener.closed) {
                window.close();
            }

        }, 100);
    });
};
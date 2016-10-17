module.exports = function() {
    get_page('black_board', function(page) {
        $('body').append(page.$container);

        var ctx = page.$("#black_board_canvas")[0].getContext('2d');
        ctx.strokeStyle = "#FF0000";

        var resize_canvas = function() {
            var width = 1280;
            var height = 720;
            page.$("#black_board_canvas").attr({width: width, height: height});
        };

        resize_canvas();
        // $(window).on('resize', resize_canvas);

        var send_thing = function(type, data) {
            var domain = window.location.protocol + '//' + window.location.hostname;
            if (window.location.port != 80) {
                domain += ":" + window.location.port
            }

            var message = {type: type, data: data};
            window.opener.postMessage(message, domain);
        };

        var pinned_x = null;
        var pinned_y = null;
        page.$("#black_board_canvas").on('click', function(e) {
            // ctx.beginPath();
            // ctx.moveTo(line.start_x, line.start_x);
            // ctx.lineTo(line.end_x, line.end_y);
            // ctx.stroke();
            //
            // send_thing('line', line);
        });

        setInterval(function() {
            if (!window.opener || window.opener.closed) {
                window.close();
            }
        }, 100);
    });
};
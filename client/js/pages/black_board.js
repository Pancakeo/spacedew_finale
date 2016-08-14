module.exports = function() {
    get_page('black_board', function(page) {
        $('body').append(page.$container);

        var ctx = page.$("#black_board_canvas")[0].getContext('2d');
        ctx.strokeStyle = "#FF0000";

        var resize_canvas = function() {
            var height = $(window).height();
            var width = $(window).width();
            page.$("#black_board_canvas").attr({width: width, height: height});
        };

        resize_canvas();

        $(window).on('resize', resize_canvas);
    });
};
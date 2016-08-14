module.exports = function($target) {
    get_page('mini_black_board', function(page) {
        $target.replaceWith(page.$container);

        page.$("#mini_black_board_canvas").on('click', function() {
            app.open_black_board();
        })
    });
};
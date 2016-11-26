module.exports = function(page) {
    var canvas = page.$("#board")[0];
    var ctx = canvas.getContext('2d');

    var board = require('../../../shared/crabble_stuff').board;
    var ui = {
        left_mouse_down: false,
        pinned_x: null,
        pinned_y: null
    };

    var setup_game = function(my_stuff, world) {
        var game = my_stuff;
        game.my_turn = false;

        page.$("#board").off('mousedown.crabble').on('mousedown.crabble', function(e) {
            var mouse = {
                x: e.clientX - this.offsetLeft,
                y: e.clientY - this.offsetTop
            };

            if (e.which == 1) {
                ui.left_mouse_down = true;
                ui.pinned_x = mouse.x;
                ui.pinned_y = mouse.y;

                if (mouse.x >= 800 && mouse.x <= 1136 && mouse.y >= 50 && mouse.y <= 98) {
                    var tile = Math.floor((mouse.x - 800) / 48);
                    ui.selected_tile = game.letters[tile];
                }
                else {
                    ui.selected_tile = null;
                }
            }
        });

        page.$("#board").off('mouseup.crabble').on('mouseup.crabble', function(e) {
            if (e.which == 1) {
                ui.left_mouse_down = false;
            }
        });

        page.$("#board").off('mouseleave.crabble').on('mouseleave.crabble', function(e) {
            ui.left_mouse_down = false;
        });

        setInterval(function() {
            if (!document.hasFocus()) {
                ui.left_mouse_down = false;
            }
        }, 250);

        page.$("#board").off('mousemove.crabble').on('mousemove.crabble', function(e) {
            var mouse = {
                x: e.clientX - this.offsetLeft,
                y: e.clientY - this.offsetTop
            };

            ui.mouse = mouse;

            if (mouse.x >= 0 && mouse.x <= 720 && mouse.y >= 0 && mouse.y <= 720) {
                var col = Math.floor(mouse.x / 48);
                var row = Math.floor(mouse.y / 48);
                ui.heh = {col: col, row: row};
            }
            else {
                ui.heh = null;
            }

            if (mouse.x >= 800 && mouse.x <= 1136 && mouse.y >= 50 && mouse.y <= 98) {
                var tile = Math.floor((mouse.x - 800) / 48);
                ui.highlighted_tile = tile;
                page.$("#board").addClass('woboy');
            }
            else {
                ui.highlighted_tile = null;
                page.$("#board").removeClass('woboy');
            }

        });

        return game;
    };
    var game;

    var render_board = function() {
        if (!game) {
            return;
        }

        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        ctx.clearRect(0, 0, 1280, 720);
        for (var row = 0; row < board.size; row++) {
            for (var col = 0; col < board.size; col++) {
                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.fillStyle = '#ddd';
                var x = col * board.tile_size;
                var y = row * board.tile_size;
                ctx.rect(x, y, board.tile_size, board.tile_size);
                ctx.fill();
                ctx.stroke();
            }
        }

        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'pink';

        var x = (board.start_square.col - 1) * board.tile_size;
        var y = (board.start_square.row - 1) * board.tile_size;
        ctx.rect(x, y, board.tile_size, board.tile_size);
        ctx.fill();

        ctx.font = "10px sans-serif";
        ctx.fillStyle = 'black';
        ctx.fillText('Start', x + 10, y + 24);
        ctx.stroke();

        board.double_letter_score.forEach(function(tile) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'cyan';
            var x = (tile.col - 1) * board.tile_size;
            var y = (tile.row - 1) * board.tile_size;
            ctx.rect(x, y, board.tile_size, board.tile_size);
            ctx.fill();

            ctx.fillStyle = 'black';
            ctx.fillText('Double L', x + 2, y + 24);
            ctx.stroke();
        });

        board.triple_letter_score.forEach(function(tile) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'blue';
            var x = (tile.col - 1) * board.tile_size;
            var y = (tile.row - 1) * board.tile_size;
            ctx.rect(x, y, board.tile_size, board.tile_size);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.fillText('TLS', x + 10, y + 24);
            ctx.stroke();
        });

        board.double_word_score.forEach(function(tile) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'pink';
            var x = (tile.col - 1) * board.tile_size;
            var y = (tile.row - 1) * board.tile_size;
            ctx.rect(x, y, board.tile_size, board.tile_size);
            ctx.fill();

            ctx.fillStyle = 'black';
            ctx.fillText('Double W', x + 2, y + 24);
            ctx.stroke();
        });

        board.triple_word_score.forEach(function(tile) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'orange';
            var x = (tile.col - 1) * board.tile_size;
            var y = (tile.row - 1) * board.tile_size;
            ctx.rect(x, y, board.tile_size, board.tile_size);
            ctx.fill();

            ctx.fillStyle = 'black';
            ctx.fillText('Triple W', x + 2, y + 24);
            ctx.stroke();
        });

        var letters = game.letters;

        var x_offset = 800;
        var y_offset = 50;
        letters.forEach(function(letter, idx) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';

            if (idx == ui.highlighted_tile) {
                ctx.fillStyle = 'lightblue';
            }
            else {
                ctx.fillStyle = 'orange';
            }

            var x = x_offset + (idx * board.tile_size);
            var y = y_offset;
            ctx.rect(x, y, board.tile_size, board.tile_size);
            ctx.fill();

            var display_letter = letter;
            if (letter == '_') {
                display_letter = ' ';
            }

            ctx.font = "12px sans-serif";
            ctx.strokeText(display_letter, x + 20, y + 26);

            ctx.font = "8px sans-serif";
            ctx.strokeText(board.get_point_value(letter), x + 36, y + 42);

            ctx.stroke();
        });

        if (ui.heh) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'gold';
            // ctx.globalAlpha = 0.5;
            ctx.rect(ui.heh.col * board.tile_size, ui.heh.row * board.tile_size, board.tile_size, board.tile_size);
            ctx.stroke();
        }

        // TODO - reduce to methods
        if (ui.selected_tile && ui.left_mouse_down) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'orange';
            ctx.strokeStyle = 'black';

            var x = ui.mouse.x;
            var y = ui.mouse.y;
            ctx.rect(x, y, board.tile_size, board.tile_size);
            ctx.fill();

            var letter = ui.selected_tile;
            var display_letter = letter;
            if (letter == '_') {
                display_letter = ' ';
            }

            ctx.font = "12px sans-serif";
            ctx.strokeText(display_letter, x + 20, y + 26);

            ctx.font = "8px sans-serif";
            ctx.strokeText(board.get_point_value(letter), x + 36, y + 42);

            ctx.stroke();
        }

    };

    var render_wrapper = function render_wrapper() {
        render_board();
        requestAnimationFrame(render_wrapper);
    };

    requestAnimationFrame(render_wrapper);

    var close_window_check = setInterval(function() {
        if (!window.opener || window.opener.closed) {
            clearInterval(close_window_check);
            window.close();
        }

    }, 100);

    var api = {
        setup_game: function() {
            game = setup_game.apply(this, arguments);
        }
    };

    return api;
};
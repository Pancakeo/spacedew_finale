module.exports = function() {

    get_page('crabble', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        var canvas = page.$("#board")[0];
        var ctx = canvas.getContext('2d');

        var board = {
            tile_size: 48,
            size: 15,
            start_square: {row: 8, col: 8},
            double_letter_score: [
                {row: 1, col: 3},
                {row: 1, col: 12},

                {row: 3, col: 7},
                {row: 3, col: 9},

                {row: 4, col: 1},
                {row: 4, col: 8},
                {row: 4, col: 15},

                {row: 7, col: 3},
                {row: 7, col: 7},
                {row: 7, col: 9},
                {row: 7, col: 13},

                {row: 8, col: 4},
                {row: 8, col: 12},

                {row: 9, col: 3},
                {row: 9, col: 7},
                {row: 9, col: 9},
                {row: 9, col: 13},

                {row: 12, col: 1},
                {row: 12, col: 8},
                {row: 12, col: 15},

                {row: 13, col: 7},
                {row: 13, col: 9},

                {row: 15, col: 3},
                {row: 15, col: 12}
            ],
            triple_letter_score: [
                {row: 2, col: 6},
                {row: 2, col: 10},

                {row: 6, col: 2},
                {row: 6, col: 6},
                {row: 6, col: 10},
                {row: 6, col: 14},

                {row: 10, col: 2},
                {row: 10, col: 6},
                {row: 10, col: 10},
                {row: 10, col: 14},

                {row: 14, col: 6},
                {row: 14, col: 10},
            ],
            double_word_score: [
                {row: 2, col: 2},
                {row: 3, col: 3},
                {row: 4, col: 4},
                {row: 5, col: 5},

                {row: 2, col: 14},
                {row: 3, col: 13},
                {row: 4, col: 12},
                {row: 5, col: 11},

                {row: 11, col: 5},
                {row: 12, col: 4},
                {row: 13, col: 3},
                {row: 14, col: 2},

                {row: 11, col: 11},
                {row: 12, col: 12},
                {row: 13, col: 13},
                {row: 14, col: 14}
            ],
            triple_word_score: [
                {row: 1, col: 1},
                {row: 1, col: 8},
                {row: 1, col: 15},

                {row: 8, col: 1},
                {row: 8, col: 15},

                {row: 15, col: 1},
                {row: 15, col: 8},
                {row: 15, col: 15}
            ]
        };

        var render_board = function() {
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
        };

        render_board();

        setInterval(function() {
            if (!window.opener || window.opener.closed) {
                window.close();
            }

        }, 100);
    });

    return {};
};
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
            letter_spread: {
                A: 9,
                B: 2,
                C: 2,
                D: 4,
                E: 12,
                F: 2,
                G: 3,
                H: 2,
                I: 9,
                J: 1,
                K: 1,
                L: 4,
                M: 2,
                N: 6,
                O: 8,
                P: 2,
                Q: 1,
                R: 6,
                S: 4,
                T: 6,
                U: 4,
                V: 2,
                W: 2,
                X: 1,
                Y: 2,
                Z: 1,
                _: 2
            },
            get_point_value: function(letter) {
                var points = {
                    0: ['_'],
                    1: ['A', 'E', 'I', 'L', 'N', 'O', 'R', 'S', 'T', 'U'],
                    2: ['D', 'G'],
                    3: ['B', 'C', 'M', 'P'],
                    4: ['F', 'H', 'V', 'W', 'Y'],
                    5: ['K'],
                    8: ['J', 'X'],
                    10: ['Q', 'Z'],
                };

                for (var value in points) {
                    var letter_set = points[value];
                    if (letter_set.indexOf(letter) >= 0) {
                        return value;
                    }
                }

            },
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

        var ui = {
            left_mouse_down: false,
            pinned_x: null,
            pinned_y: null
        };

        var create_game = function() {
            var game = {
                letters: [],
                players: {},
                current_turn: null,
                scores: {}
            };

            game.letters = [];
            for (var letter in board.letter_spread) {
                var tiles = board.letter_spread[letter];
                for (var i = 1; i <= tiles; i++) {
                    game.letters.push(letter);
                }
            }

            game.letters = _.shuffle(game.letters);

            game.players['Pancakeo'] = {};
            game.players['Pancakeo'].letters = _.sampleSize(game.letters, 7);

            game.players['Pancakeo'].letters.forEach(function(letter) {
                var idx = game.letters.indexOf(letter);
                game.letters.splice(idx, 1);
            });

            return game;
        };

        var game = create_game();

        var sum = 0;
        for (var letter in board.letter_spread) {
            var sub_total = board.letter_spread[letter];
            sum += sub_total;
        }

        var render_board = function() {
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

            var letters = game.players['Pancakeo'].letters;

            var x_offset = 800;
            var y_offset = 50;
            letters.forEach(function(letter, idx) {
                ctx.beginPath();
                ctx.strokeStyle = 'black';

                if (idx == game.highlighted_tile) {
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

            if (game.heh) {
                ctx.beginPath();
                ctx.lineWidth = 5;
                ctx.strokeStyle = 'gold';
                // ctx.globalAlpha = 0.5;
                ctx.rect(game.heh.col * board.tile_size, game.heh.row * board.tile_size, board.tile_size, board.tile_size);
                ctx.stroke();
            }

            // TODO - reduce to methods
            if (game.selected_tile && ui.left_mouse_down) {
                ctx.beginPath();
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = 'orange';
                ctx.strokeStyle = 'black';

                var x = ui.mouse.x;
                var y = ui.mouse.y;
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
            }

        };

        page.$("#board").on('mousedown', function(e) {
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
                    game.selected_tile = game.players['Pancakeo'].letters[tile];
                }
                else {
                    game.selected_tile = null;
                }
            }
        });

        page.$("#board").on('mouseup', function(e) {
            if (e.which == 1) {
                ui.left_mouse_down = false;
            }
        });

        page.$("#board").on('mouseleave', function(e) {
            ui.left_mouse_down = false;
        });

        setInterval(function() {
            if (!document.hasFocus()) {
                ui.left_mouse_down = false;
            }
        }, 250);

        page.$("#board").on('mousemove', function(e) {
            var mouse = {
                x: e.clientX - this.offsetLeft,
                y: e.clientY - this.offsetTop
            };

            ui.mouse = mouse;

            if (mouse.x >= 0 && mouse.x <= 720 && mouse.y >= 0 && mouse.y <= 720) {
                var col = Math.floor(mouse.x / 48);
                var row = Math.floor(mouse.y / 48);
                game.heh = {col: col, row: row};
            }
            else {
                game.heh = null;
            }

            if (mouse.x >= 800 && mouse.x <= 1136 && mouse.y >= 50 && mouse.y <= 98) {
                var tile = Math.floor((mouse.x - 800) / 48);
                game.highlighted_tile = tile;
                page.$("#board").addClass('woboy');
            }
            else {
                game.highlighted_tile = null;
                page.$("#board").removeClass('woboy');
            }

        });

        var render_wrapper = function render_wrapper() {
            render_board();
            requestAnimationFrame(render_wrapper);
        };

        requestAnimationFrame(render_wrapper);

        setInterval(function() {
            if (!window.opener || window.opener.closed) {
                window.close();
            }

        }, 100);
    });

    return {};
};
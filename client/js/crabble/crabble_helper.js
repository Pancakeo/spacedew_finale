// TODO - prevent stacking
// TODO - blank letter assignment

module.exports = function(page) {
    var board = require('../../../shared/crabble_stuff').board;
    var dictionary = require('../../../shared/crabble_dictionary');

    var game = {
        my_turn: false
    };

    var end_turn = function() {
        game.my_turn = false;
        page.$("#letters .selected").removeClass('selected');
        page.$("#board .woboy").removeClass('woboy');
    };

    var place_letter = function($tile, $letter) {
        $letter.css({
            left: $tile[0].style.left,
            top: $tile[0].style.top,
            position: 'absolute'
        });

        var col = $tile.attr('col');
        var row = $tile.attr('row');

        $letter.attr({col: col, row: row});

        page.$("#board").append($letter);
        page.$("#letters .letter").removeClass('selected');
        $letter.removeClass('selected');
    };

    page.$("button").button();

    page.$("#play_hand").on('click', function() {
        var $in_play = page.$("#board .letter:not(.stone)");
        var $board = page.$("#board");

        if (!game.my_turn || $in_play.length == 0) {
            return;
        }

        var stacked = false;
        var $existing_tiles = $board.find(".letter.stone");

        var $sorted = $in_play.sort(function(a, b) {
            var $a = $(a);
            var $b = $(b);

            var pos_a = {row: $a.attr('row'), col: $a.attr('col')};
            var pos_b = {row: $b.attr('row'), col: $b.attr('col')};

            if (pos_a.row == pos_b.row && pos_a.col == pos_b.col) {
                stacked = true;
                return 0;
            }

            if (pos_a.row < pos_b.row) {
                return -1;
            }
            else if (pos_a.row > pos_b.row) {
                return 1;
            }
            else if (pos_a.col < pos_b.col) {
                return -1;
            }
            else {
                return 1;
            }
        });

        // Must play start square.
        if ($existing_tiles.length == 0) {
            var start_square = board.start_square;

            var $played_start_square = $board.find('div.letter[col="' + start_square.col + '"][row="' + start_square.row + '"]');
            if ($played_start_square.length == 0) {
                page.alert("Invalid Move", "Must play Start Square");
            }
        }

        // All tiles must be connected, no diagonals or lone tiles.

        // Go through rows/columns to form words.

        // ... And remember to use existing stuff, too.

        // Now for the harder part...

        if (stacked) {
            page.alert("Invalid Move", "Two or more tiles are stacked.");
        }
    });

    page.$("#pass_turn").on('click', function() {
        if (!game.my_turn) {
            return;
        }

        page.send('end_turn', {game_id: game.game_id, action: 'pass'});
        end_turn();
    });

    page.$("#reset_turn").on('click', function() {
        if (!game.my_turn) {
            return;
        }

        page.$("#board .letter:not(.stone)").remove();
        crabble_helper.update_letters(game.my_stuff.letters);
    });

    page.$("#letters").on('click', '.letter', function() {
        if (!game.my_turn) {
            return;
        }

        $(this).siblings('.letter').removeClass('selected');
        $(this).addClass('selected');
    });

    page.$("#board").on('click', '.tile.empty', function() {
        if (!game.my_turn) {
            return;
        }

        var $selected_letter = page.$("#letters .selected");
        var $letter = $selected_letter.clone();
        var $tile = $(this);

        place_letter($tile, $letter);
        $selected_letter.remove();
    });

    page.$("#board").on('mousemove', '.tile.empty', function() {
        if (!game.my_turn || page.$("#letters .letter.selected").length == 0) {
            return;
        }

        $(this).siblings('.woboy').removeClass('woboy');
        $(this).addClass('woboy');
    });

    page.$("#board").on('mouseleave', function() {
        $(this).find('.woboy').removeClass('woboy');
    });

    var setup_game = function(game_data) {
        var $board = page.$("#board");
        game = game_data;
        var $fragment = $(document.createDocumentFragment());

        var update_square = function(square, class_name) {
            var col = square.col - 1;
            var row = square.row - 1;

            var create_tile = false;
            var $tile = $fragment.find('div.tile[row="' + square.row + '"][col="' + square.col + '"]');

            if ($tile.length == 0) {
                create_tile = true;
                $tile = $('<div class="tile"/>');
                $tile.attr({row: square.row, col: square.col});
            }
            else {
                $tile.removeClass('blank');
            }

            switch (class_name) {
                case 'start_square':
                    $tile.html('&#9749;');
                    break;

                case 'double_letter_square':
                    $tile.text('Double Letter Score');
                    break;

                case 'triple_letter_square':
                    $tile.text('Triple Letter Score');
                    break;

                case 'double_word_square':
                    $tile.text('Double Word Score');
                    break;

                case 'triple_word_square':
                    $tile.text('Triple Word Score');
                    break;
            }

            $tile.css({left: col * 48, top: row * 48});
            $tile.addClass(class_name);

            if (create_tile) {
                $fragment.append($tile);
            }
        };

        var process_group = function(group, class_name) {
            group.forEach(function(square) {
                update_square(square, class_name);
            });
        };

        for (var col = 1; col <= 15; col++) {
            for (var row = 1; row <= 15; row++) {
                update_square({col: col, row: row}, 'blank');
            }
        }

        update_square(board.start_square, 'start_square');
        process_group(board.double_letter_score, 'double_letter_square');
        process_group(board.triple_letter_score, 'triple_letter_square');
        process_group(board.double_word_score, 'double_word_square');
        process_group(board.triple_word_score, 'triple_word_square');
        $board.append($fragment);
        page.$("#board").find(".tile").addClass('empty');

        page.$("#board").find('.tile').droppable({
            accept: '.letter',
            hoverClass: 'woboy',
            drop: function(event, ui) {
                if (!game.my_turn) {
                    return;
                }

                var $tile = $(this);
                var $letter = ui.draggable;
                place_letter($tile, $letter);
                $letter.draggable({helper: 'clone', delay: 100});
            }
        });

        return game;
    };

    var close_window_check = setInterval(function() {
        if (!window.opener || window.opener.closed) {
            clearInterval(close_window_check);
            window.close();
        }

    }, 100);

    var crabble_helper = {
        setup_game: function() {
            setup_game.apply(this, arguments);
        },
        hot_seat: function(data) {
            var username = app.profile.username;
            page.$("#players_list tbody tr").removeClass('active');
            page.$("#players_list tbody").find('tr[player_name="' + data.hot_seat + '"]').addClass('active');

            game.my_turn = (username == data.hot_seat);
            page.$("#gogogo").toggle(game.my_turn);
            page.$("#turn_stuff").toggle(game.my_turn);
            page.$("#not_yet").toggle(!game.my_turn);
        },
        update_letters: function(letters) {
            var $letters = page.$("#letters").empty();
            var $fragment = $(document.createDocumentFragment());

            letters.forEach(function(letter) {
                var $letter = $('<div class="letter"/>');
                $letter.prop('letter', letter);
                var $value = $('<div class="letter_value"/>');

                $value.text(board.get_point_value(letter));
                $letter.text(letter);
                $letter.append($value);
                $fragment.append($letter);
            });

            $letters.sortable({
                items: '.letter',
                delay: 100,
                start: function() {
                    $(this).find('.letter').removeClass('selected');
                }
            });

            $letters.append($fragment);

            $letters.find('.letter').draggable({
                helper: 'clone',
                delay: 100
            });
        }
    };

    return crabble_helper;
};
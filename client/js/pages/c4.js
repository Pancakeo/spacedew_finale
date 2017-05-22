module.exports = function(options) {
    options = $.extend({
        room_id: null
    }, options);

    var game = {};
    const room_id = options.room_id;

    get_page('c4', {popup: true}, function(page) {
        var $wait_dialog = $('<div>Waiting Is...</div>').dialog({
            title: "Waiting for other players...",
            modal: true
        });

        var $parent = $('body');
        $parent.append(page.$container);

        const get_cell = function(col, row) {
            var $cell = page.$("#grid").find('.cell[row="' + row + '"][col="' + col + '"]');
            return $cell;
        };

        page.$("#grid").on('click', '.col_drop', function() {
            page.send('move', {column: $(this).prop('column')});
        });

        var my_username;
        var me;

        const draw_board = function() {
            var $grid = page.$("#grid").empty();
            var $grid_fragment = $(document.createDocumentFragment());

            var current_row = null;
            var $grid_row = null;

            $grid_row = $('<div/>');
            for (var col = 1; col <= 7; col++) {
                var $cell = $('<div class="cell"/>');
                var $button = $('<button class="col_drop">v</button>').prop('column', col);
                $cell.append($button);
                $grid_row.append($cell);
            }
            $grid_fragment.append($grid_row);

            game.board.forEach(function(cell) {
                if (cell.row != current_row) {
                    current_row = cell.row;
                    $grid_row = $('<div class="row"/>');
                    $grid_fragment.append($grid_row);
                }

                var $cell = $('<div class="cell"/>').attr({row: cell.row, col: cell.col}).prop('cell', cell);

                if (cell.color != null) {
                    var $color_circle = $('<div class="circle"/>');
                    $color_circle.addClass(cell.color);
                    $cell.append($color_circle);
                }


                $grid_row.append($cell);
            });

            $grid.empty().append($grid_fragment);
            page.$(".col_drop").button();
        };

        const draw_payers = function() {
            var $players = $(document.createDocumentFragment());

            game.players.forEach(function(p) {
                var $player = $('<div class="user"/>').text(p.name);
                $players.append($player);
            });

            page.$("#players").empty().append($players);
        };

        const update_turn = function() {
            if (game.current_turn == my_username) {
                page.$("#status").addClass('go_already').text("It's your turn!");
                page.$(".col_drop").button('enable');
            }
            else {
                page.$(".col_drop").button('disable');
                if (game.current_turn == null) {
                    page.$("#status").removeClass('go_already').text("It all over.");
                }
                else {
                    page.$("#status").removeClass('go_already').text("Waiting for " + game.current_turn);
                }

            }
        };

        page.always_send = {
            room_id: room_id
        };

        page.send('enter_game', {});
        page.listen('game_ready', function(data) {
            data.players.some(function(p) {
                if (p.name == my_username) {
                    me = p;
                    return true;
                }
            });

            page.$("#my_letter").text(me.color);

            $wait_dialog && $wait_dialog.dialog('close');
            $wait_dialog = null;

            game = data;

            draw_board();
            draw_payers();
            update_turn();
        });

        page.listen('current_turn', function(data) {
            game.current_turn = data.current_turn;
            update_turn();
        });

        page.listen('move', function(data) {
            var $cell = get_cell(data.move.col, data.move.row);
            $cell.prop('cell').color = data.move.color;
            draw_board();
        });

        page.listen('player_info', function(data) {
            my_username = data.username;
        });

        page.listen('system', function(data) {
            var $chat = $('<div class="message_wrapper"/>');
            var $message = $('<div class="message">' + data.message + '</div>');
            $message.css({color: 'green'});
            $chat.append($message);

            var $messages = page.$("#messages");
            $messages.append($chat);

            $messages.scrollTop($messages[0].scrollHeight);
        });

        page.listen('chat', function(data) {
            var $chat = $('<div class="message_wrapper"/>');
            var $user = $('<div class="username">' + data.username + ': </div>');
            var $message = $('<div class="message">' + data.message + '</div>');
            $chat.append($user, $message);

            var $messages = page.$("#messages");
            $messages.append($chat);

            $messages.scrollTop($messages[0].scrollHeight);
        });

        page.$("#composer").on('keypress', function(e) {
            if (e.which == 13) {
                var message = $(this).val().trim();
                page.$("#composer").val('');

                if (message.length > 0) {
                    page.send('chat', {message: message});
                }
            }
        });
    });

    return {};
};
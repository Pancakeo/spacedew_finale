module.exports = function(options) {
    const room_id = app.toolio.get_query_param('room_id');
    let game = {};

    const sendMessage = function(sub_type, data) {
        data = $.extend(data, {room_id: room_id});

        postMessage({
            listener_name: 'ws.send',
            type: page.page_name,
            sub_type: sub_type,
            message: data
        })
    };

    get_page('tick_tack', {popup: true}, function(page) {
        let $wait_dialog = $('<div>Waiting Is...</div>').dialog({
            title: "Waiting for other players...",
            modal: true
        });

        const get_cell = function(col, row) {
            let $cell = page.$("#grid").find('.cell[row="' + row + '"][col="' + col + '"]');
            return $cell;
        };

        page.$("#grid").on('click', '.cell', function() {
            let $cell = $(this);
            let cell = $cell.prop('cell');

            if (cell.letter == null) {
                page.get_template('tile_select').dialog({
                    modal: true,
                    title: 'Select Tile',
                    open: function() {
                        $(this).find('.letter').each(function() {
                            $(this).prop('letter', $(this).text());
                        });

                        $(this).on('click', '.letter', function() {
                            $(this).siblings().removeClass('selected');
                            $(this).addClass('selected');
                        })
                    },
                    buttons: {
                        'Confirm': function() {
                            let letter = $(this).find('.selected').prop('letter');
                            if (letter == null) {
                                page.alert("Hey Now", "Must Choose.");
                                return;
                            }

                            page.send('move', {cell: cell, letter: letter});
                            $(this).dialog('close');
                        },
                        'Cancel': function() {
                            $(this).dialog('close');
                        }
                    }
                })
            }
        });

        let my_username;

        const draw_board = function() {
            let $grid = page.$("#grid");
            let $grid_fragment = $(document.createDocumentFragment());

            let current_row = null;
            let $grid_row = null;

            game.board.forEach(function(cell) {
                if (cell.row != current_row) {
                    current_row = cell.row;
                    $grid_row = $('<div class="row"/>');
                    $grid_fragment.append($grid_row);
                }

                let $cell = $('<div class="cell empty"/>').attr({row: cell.row, col: cell.col}).prop('cell', cell);
                $grid_row.append($cell);
            });

            $grid.empty().append($grid_fragment);
        };

        const draw_payers = function() {
            let $players = $(document.createDocumentFragment());

            game.players.forEach(function(p) {
                let $player = $('<div class="user"/>').text(p.name);
                $players.append($player);
            });

            page.$("#players").empty().append($players);
        };

        const update_turn = function() {
            if (game.current_turn == my_username) {
                page.$("#status").addClass('go_already').text("It's your turn!");

                let $grid = page.$("#grid");

                game.board.forEach(function(cell) {
                    let $cell = get_cell(cell.col, cell.row);

                    if (cell.letter == null) {
                        $cell.addClass('allowed');
                    }
                    else {
                        $cell.addClass('not_allowed');
                    }
                });
            }
            else {
                page.$("#status").removeClass('go_already').text("Waiting for " + game.current_turn);
            }
        };

        page.always_send = {
            room_id: room_id
        };

        let $parent = $('body');
        $parent.append(page.$container);

        page.send('enter_game', {});
        page.listen('game_ready', function(data) {
            $wait_dialog && $wait_dialog.dialog('close');
            game = data;
            draw_board();
            draw_payers();
            update_turn();
        });

        page.listen('player_info', function(data) {
            my_username = data.username;
        });

        page.listen('system', function(data) {
            let $chat = $('<div class="message_wrapper"/>');
            let $message = $('<div class="message">' + data.message + '</div>');
            $message.css({color: 'green'});
            $chat.append($message);

            let $messages = page.$("#messages");
            $messages.append($chat);

            $messages.scrollTop($messages[0].scrollHeight);
        });

        page.listen('chat', function(data) {
            let $chat = $('<div class="message_wrapper"/>');
            let $user = $('<div class="username">' + data.username + ': </div>');
            let $message = $('<div class="message">' + data.message + '</div>');
            $chat.append($user, $message);

            let $messages = page.$("#messages");
            $messages.append($chat);

            $messages.scrollTop($messages[0].scrollHeight);
        });

        page.$("#composer").on('keypress', function(e) {
            if (e.which == 13) {
                let message = $(this).val().trim();
                page.$("#composer").val('');

                if (message.length > 0) {
                    page.send('chat', {message: message});
                }
            }
        });
    });

    setInterval(function() {
        if (!window.opener || window.opener.closed) {
            window.close();
        }
    }, 100);

    return {};
};
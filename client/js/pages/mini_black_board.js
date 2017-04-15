module.exports = function($target, room, $room_box) {
    var canvas_handler = require('../../../shared/canvas_handler');

    get_page('mini_black_board', function(page) {
        $target.append(page.$container);
        page.$container.attr('room_id', room.id);

        $room_box.prop('whewboard', page.$container);

        var canvas = page.$("#mini_black_board_canvas")[0];
        var ctx = canvas.getContext('2d');
        ctx.scale(0.2, 0.2);

        var ch = canvas_handler(ctx);

        page.$("#mini_black_board_canvas").on('click', function() {
            app.open_black_board();
        });

        var pass_it_up = function(data) {
            data = $.extend(data, {listener_name: 'black_board'});
            if (app.black_board && app.black_board.closed != true) {
                app.black_board.postMessage(data, app.domain);
            }
        };

        app.event_bus.on('update_room_id', function(params) {
            if (params.old_room.id == room.id) {
                room = params.new_room;
            }
        });

        page.peepy('black_board.load', function(data) {
            if (data.room_id == room.id) {
                data.type = 'load';
                pass_it_up(data);

                ch.handle_thing({type: 'colorful_clear', color: data.bg_color, nuke: true});

                data.commands.forEach(function(thing) {
                    ch.handle_thing(thing);
                });
            }
        });

        page.peepy('black_board.draw', function(info) {
            if (info.room_id == room.id) {
                pass_it_up(info);
                ch.handle_thing(info);
            }
        });

        // Not hacky at all.
        if (app.is_mobile) {
            $("#mini_black_board").hide();
            $("#users").attr('style', 'height: 100%;');
        }
    });
};
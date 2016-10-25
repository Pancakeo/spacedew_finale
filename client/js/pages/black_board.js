module.exports = function() {
    var canvas_handler = require('../../../shared/canvas_handler');

    get_page('black_board', function(page) {
        $('body').append(page.$container);

        var pinned_x = null;
        var pinned_y = null;
        var left_mouse_down = false;
        var hold_up = null;
        var fg_color = '#000000';
        var stroke_width = 1;
        var alpha = 255;

        // Thanks, StarkOverflow.
        function rgb2hex(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }

            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }

        var ctx = page.$("#black_board_canvas")[0].getContext('2d');
        ctx.strokeStyle = fg_color;

        var ch = canvas_handler(ctx);

        var resize_canvas = function() {
            var width = 1280;
            var height = 720;
            page.$("#black_board_canvas").attr({width: width, height: height});
        };

        resize_canvas();

        var send_thing = function(type, data) {
            var message = {action: 'draw', type: type, data: data};
            window.opener.postMessage(message, app.domain);
        };

        page.$("#black_board_canvas").on('mouseup', function(e) {
            if (e.which == 1) {
                left_mouse_down = false;
            }
        });

        page.$("#controls").on('click', '[menu_item]', function() {
            var menu_item = $(this).attr('menu_item');
            switch (menu_item) {
                case 'great_clear':
                    ctx.clearRect(0, 0, 1280, 720);
                    send_thing('great_clear', {});
                    break;

                default:
                    break;
            }
        });

        page.$("#fg_color").on('change', function() {
            var $match = page.$("#color_wheel .color[rgb_val='" + fg_color + "']");

            if ($match.length == 0) {
                var $last = page.$("#color_wheel .color:last").detach();
                $last.css('background', fg_color);
                page.$("#color_wheel").prepend($last);
            }

            fg_color = this.value;
        });

        page.$("#black_board_canvas").on('mouseleave', function(e) {
            hold_up = setTimeout(function() {
                left_mouse_down = false;
            }, 500);

        });

        setInterval(function() {
            if (!document.hasFocus()) {
                left_mouse_down = false;
            }
        }, 250);


        page.$("#black_board_canvas").on('mousedown', function(e) {

            if (e.which == 1) {
                left_mouse_down = true;
                pinned_x = e.clientX - this.offsetLeft;
                pinned_y = e.clientY - this.offsetTop;

                // var x = pinned_x;
                // var y = pinned_y;
                // var size = 1;
                // ctx.beginPath();
                // ctx.fillStyle = fg_color;
                // ctx.fillRect(x, y, size, size);
                // ctx.stroke();
                //
                // var rekt = {
                //     color: fg_color,
                //     alpha: alpha,
                //     x: pinned_x,
                //     y: pinned_y,
                //     size: size
                // };
                // send_thing('rekt', rekt);
            }
        });

        page.$("#black_board_canvas").on('mousemove', function(e) {
            if (left_mouse_down) {
                clearTimeout(hold_up);
                
                var end_x = e.clientX - this.offsetLeft;
                var end_y = e.clientY - this.offsetTop;

                var line = {
                    start_x: pinned_x,
                    start_y: pinned_y,
                    end_x: end_x,
                    end_y: end_y,
                    color: fg_color,
                    alpha: 255,
                    line_width: stroke_width
                };

                ctx.beginPath();
                ctx.strokeStyle = fg_color;
                ctx.lineWidth = stroke_width;
                ctx.moveTo(line.start_x, line.start_y);
                ctx.lineTo(line.end_x, line.end_y);
                ctx.stroke();

                pinned_x = end_x;
                pinned_y = end_y;

                send_thing('line', line);
            }
        });

        window.addEventListener('message', function(e) {
            var info = e.data;
            var data = info.data;

            if (info.type != 'load') {
                if (info.username == app.profile.username) {
                    return;
                }
            }

            ch.handle_thing(info);
        });

        setInterval(function() {
            if (!window.opener || window.opener.closed) {
                window.close();
            }
        }, 100);

        var colors = ['red', 'blue', 'orange', 'green', 'black', 'white'];
        colors.forEach(function(color) {
            var $color = $('<div class="color"></div>');
            $color.css('background', color);
            page.$("#color_wheel").append($color);
            $color.attr('rgb_val', rgb2hex($color.css('backgroundColor')));
        });

        page.$("#color_wheel").on('click', '.color', function() {
            var bg_color = $(this).css('backgroundColor');
            bg_color = rgb2hex(bg_color);

            page.$("#fg_color").val(bg_color);
            fg_color = bg_color;
        });

        var $handle = $("#custom-handle");
        page.$("#size_thing").slider({
                min: 1,
                max: 100,
                create: function() {
                    $handle.text($(this).slider("value"));
                },
                slide: function(event, ui) {
                    $handle.text(ui.value);
                    stroke_width = ui.value;
                }
            }
        );

        window.opener.postMessage({action: 'load'}, app.domain);
    });
};
module.exports = function() {
    var canvas_handler = require('../../../shared/canvas_handler');

    get_page('black_board', function(page) {
        $('body').append(page.$container);

        var pinned_x = null;
        var pinned_y = null;
        var left_mouse_down = false;
        var hold_up = null;
        var fg_color = '#ffffff';
        var stroke_width = 1;
        var alpha = 255;
        var bg_color = '#000000';

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

        var position = {
            x: -500,
            y: -500
        };

        var overlay_ctx = page.$("#overlay_canvas")[0].getContext('2d');
        overlay_ctx.font = "14px serif";

        var ch = canvas_handler(ctx);

        var send_thing = function(type, data) {
            var message = {action: 'draw', type: type, data: data};
            window.opener.postMessage(message, app.domain);
        };

        page.$("#controls").on('click', '[menu_item]', function() {
            var menu_item = $(this).attr('menu_item');
            switch (menu_item) {
                case 'great_clear':
                    ctx.beginPath();
                    ctx.fillStyle = bg_color;
                    ctx.fillRect(0, 0, 1280, 720);
                    ctx.stroke();
                    send_thing('colorful_clear', {color: bg_color});
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

        page.$("#bg_color").on('change', function() {
            ctx.beginPath();
            ctx.fillStyle = this.value;
            ctx.fillRect(0, 0, 1280, 720);
            ctx.stroke();

            send_thing('colorful_clear', {color: this.value});
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

        page.$("#overlay_canvas").on('mouseup', function(e) {
            if (e.which == 1) {
                left_mouse_down = false;
            }
        });

        page.$("#overlay_canvas").on('mousedown', function(e) {

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

        setInterval(function() {
            if (Date.now() - position.last_change <= 100) {
                send_thing('position', position);
            }
        }, 16);

        page.$("#overlay_canvas").on('mousemove', function(e) {
            var end_x = e.clientX - this.offsetLeft;
            var end_y = e.clientY - this.offsetTop;

            var changed = false;
            if (position.x != end_x || position.y != end_y) {
                changed = true;
            }

            position = {
                x: end_x,
                y: end_y
            };

            if (changed) {
                position.last_change = Date.now();
            }

            if (left_mouse_down) {
                clearTimeout(hold_up);

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

        function invertColor(hexTripletColor) {
            var color = hexTripletColor;
            color = color.substring(1);           // remove #
            color = parseInt(color, 16);          // convert to integer
            color = 0xFFFFFF ^ color;             // invert three bytes
            color = color.toString(16);           // convert to hex
            color = ("000000" + color).slice(-6); // pad with leading zeros
            color = "#" + color;                  // prepend #
            return color;
        }

        window.addEventListener('message', function(e) {
            var info = e.data;
            var data = info.data;

            if (info.type == 'colorful_clear') {
                bg_color = data.color;
            }

            if (info.type != 'load') {
                if (info.username == app.profile.username) {
                    return;
                }
            }

            if (info.type == 'position') {
                overlay_ctx.beginPath();
                overlay_ctx.clearRect(0, 0, 1280, 720);

                var contrast_color = invertColor(bg_color);

                overlay_ctx.fillStyle = contrast_color;
                overlay_ctx.fillText(info.username, data.x, data.y);
                overlay_ctx.stroke();
            }

            if (info.type == 'load') {
                bg_color = info.bg_color;
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
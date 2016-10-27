module.exports = function() {
    var canvas_handler = require('../../../shared/canvas_handler');

    get_page('black_board', function(page) {
        $('body').append(page.$container);

        var $wait_dialog = $('<div>Syncing...</div>').dialog({
            title: "Loading",
            modal: true
        });

        var pinned_x = null;
        var pinned_y = null;
        var left_mouse_down = false;
        var hold_up = null;
        var fg_color = '#ffffff';
        var stroke_width = 1;
        var alpha = 1;
        var bg_color = '#000000';
        var draw_style = 'line';
        var phil = true;

        // Thanks, StarkOverflow.
        var rgb2hex = function(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }

            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        };

        var invertColor = function(hexTripletColor) {
            var color = hexTripletColor;
            color = color.substring(1);           // remove #
            color = parseInt(color, 16);          // convert to integer
            color = 0xFFFFFF ^ color;             // invert three bytes
            color = color.toString(16);           // convert to hex
            color = ("000000" + color).slice(-6); // pad with leading zeros
            color = "#" + color;                  // prepend #
            return color;
        };

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
                    ctx.globalAlpha = 1;
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
            ctx.globalAlpha = 1;
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

                if (draw_style != 'line') {
                    draw_handlers[draw_style](pinned_x, pinned_y);
                }
            }
        });

        setInterval(function() {
            if (Date.now() - position.last_change <= 100) {
                send_thing('position', position);
            }
        }, 100);

        var draw_handlers = {
            line: function(end_x, end_y) {
                var line = {
                    start_x: pinned_x,
                    start_y: pinned_y,
                    end_x: end_x,
                    end_y: end_y,
                    color: fg_color,
                    alpha: alpha,
                    line_width: stroke_width
                };

                ctx.beginPath();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = fg_color;
                ctx.lineWidth = stroke_width;
                ctx.moveTo(line.start_x, line.start_y);
                ctx.lineTo(line.end_x, line.end_y);
                ctx.stroke();

                send_thing('line', line);
            },
            rekt: function(end_x, end_y) {
                var rekt = {
                    start_x: pinned_x,
                    start_y: pinned_y,
                    color: fg_color,
                    alpha: alpha,
                    size: stroke_width,
                    phil: phil
                };

                ctx.beginPath();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = fg_color;
                ctx.rect(pinned_x, pinned_y, stroke_width, stroke_width);
                ctx.stroke();

                if (phil) {
                    ctx.fillStyle = fg_color;
                    ctx.fill();
                }

                send_thing('rekt', rekt);
            },
            circle: function(end_x, end_y) {
                var circle = {
                    start_x: pinned_x,
                    start_y: pinned_y,
                    color: fg_color,
                    alpha: alpha,
                    radius: stroke_width,
                    phil: phil
                };

                ctx.beginPath();
                ctx.globalAlpha = alpha;
                ctx.arc(pinned_x, pinned_y, stroke_width, 0, 2 * Math.PI, false);

                if (phil) {
                    ctx.fillStyle = fg_color;
                    ctx.fill();
                }

                ctx.strokeStyle = fg_color;
                ctx.stroke();
                send_thing('circle', circle);
            }
        };

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

                draw_handlers[draw_style](end_x, end_y);

                pinned_x = end_x;
                pinned_y = end_y;
            }
        });

        var draw_queue = [];
        window.addEventListener('message', function(e) {
            var info = e.data;
            var data = info.data;

            if (info.type == 'colorful_clear') {
                bg_color = data.color;
            }

            if (info.type == 'load') {
                $wait_dialog && $wait_dialog.dialog('close');
                $wait_dialog = null;

                draw_queue.forEach(function(info) {
                    ch.handle_thing(info);
                });
            }

            if (info.type != 'load') {
                if (info.username == app.profile.username) {
                    return;
                }
            }

            if (info.type == 'positions') {
                var contrast_color = invertColor(bg_color);
                overlay_ctx.beginPath();
                overlay_ctx.clearRect(0, 0, 1280, 720);
                ctx.globalAlpha = 0.5;
                overlay_ctx.fillStyle = contrast_color;

                for (var key in info.positions) {
                    if (key != app.profile.username) {
                        var p = info.positions[key];
                        overlay_ctx.fillText(key, p.x, p.y);
                    }
                }

                overlay_ctx.stroke();
            }

            if (info.type == 'load') {
                bg_color = info.bg_color;
            }

            if ($wait_dialog) {
                draw_queue.push(info);
                return;
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

        var $size_thing_handle = $("#size_thing_handle");
        page.$("#size_thing").slider({
                min: 1,
                max: 100,
                create: function() {
                    $size_thing_handle.text($(this).slider("value"));
                },
                slide: function(event, ui) {
                    $size_thing_handle.text(ui.value);
                    stroke_width = ui.value;
                }
            }
        );

        var $alpha_thing_handle = $("#alpha_thing_handle");
        page.$("#alpha_thing").slider({
                min: 0,
                max: 100,
                value: 100,
                create: function() {
                    $alpha_thing_handle.text($(this).slider("value"));
                },
                slide: function(event, ui) {
                    $alpha_thing_handle.text(ui.value);
                    alpha = ui.value / 100;
                }
            }
        );

        window.opener.postMessage({action: 'load'}, app.domain);

        page.$("#buttons button").on('click', function() {
            $(this).siblings('button').removeClass('active');
            $(this).addClass('active');
            draw_style = $(this).attr('draw_style');
        });

        page.$("#phil").on('change', function() {
            phil = $(this).prop('checked');
        })
    });
};
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

        var selecting = false;
        var select_box = {};
        var positions = {};

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

        var ch = canvas_handler(ctx);

        var send_thing = function(type, data) {
            var message = {action: 'draw', type: type, data: data};
            ch.handle_thing(message);
            window.opener.postMessage(message, app.domain);
        };

        page.$("#controls").on('click', '[menu_item]', function() {
            var menu_item = $(this).attr('menu_item');
            switch (menu_item) {
                case 'great_clear':
                    send_thing('colorful_clear', {color: bg_color, nuke: true});
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
            send_thing('colorful_clear', {color: this.value, nuke: true});
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

                send_thing('line', line);
            },
            rekt: function(end_x, end_y) {
                var start_x = pinned_x - (stroke_width / 2);
                var start_y = pinned_y - (stroke_width / 2);

                start_x = Math.floor(start_x);
                start_y = Math.floor(start_y);

                var rekt = {
                    start_x: start_x,
                    start_y: start_y,
                    color: fg_color,
                    alpha: alpha,
                    size: stroke_width,
                    phil: phil
                };

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

                send_thing('circle', circle);
            }
        };

        var redraw_overlay = function() {
            overlay_ctx.clearRect(0, 0, 1280, 720);

            if (select_box && Object.keys(select_box).length > 0) {
                overlay_ctx.beginPath();
                overlay_ctx.globalAlpha = 1;
                overlay_ctx.strokeStyle = fg_color;
                overlay_ctx.setLineDash([5, 5]);
                overlay_ctx.rect(select_box.start_x, select_box.start_y, select_box.width, select_box.height);
                overlay_ctx.lineWidth = 1;
                overlay_ctx.stroke();
            }

            var contrast_color = invertColor(bg_color);
            overlay_ctx.beginPath();
            ctx.globalAlpha = 0.5;
            overlay_ctx.font = "14px serif";
            overlay_ctx.fillStyle = contrast_color;

            for (var key in positions) {
                if (key != app.profile.username) {
                    var p = positions[key];
                    overlay_ctx.fillText(key, p.x, p.y);
                }
            }

            overlay_ctx.stroke();
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

                if (selecting) {
                    var width = Math.abs(pinned_x - end_x);
                    var height = Math.abs(pinned_y - end_y);
                    var start_x = Math.min(pinned_x, end_x);
                    var start_y = Math.min(pinned_y, end_y);

                    select_box = {
                        start_x: start_x,
                        start_y: start_y,
                        width: width,
                        height: height
                    };

                    redraw_overlay();
                }
                else {
                    draw_handlers[draw_style](end_x, end_y);
                    pinned_x = end_x;
                    pinned_y = end_y;
                }

            }
        });

        var draw_queue = [];
        window.addEventListener('message', function(e) {
            var info = e.data;
            var data = info.data;

            if (info.type == 'colorful_clear' && data.nuke) {
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
                positions = info.positions;
                redraw_overlay();
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

        page.$("#buttons button:not(#textbook)").on('click', function() {
            $(this).siblings('button').removeClass('active');
            $(this).addClass('active');
            draw_style = $(this).attr('draw_style');
        });

        page.$("#phil").on('change', function() {
            phil = $(this).prop('checked');
        });

        var stop_selecting = function() {
            page.$("#rect_tool").removeClass('active');
            selecting = false;
            page.$("#textbook").prop('disabled', true);
            select_box = {};
            redraw_overlay();
        };

        page.$("#rect_tool").on('click', function() {
            $(this).toggleClass('active');
            selecting = $(this).hasClass('active');

            page.$("#textbook").prop('disabled', !selecting);
            if (!selecting) {
                stop_selecting();
            }
        });

        page.$("#overlay_canvas").on('keydown', function(e) {
            if (!selecting) {
                if (e.keyCode == 66) {
                    page.$("#rect_tool").click();
                }
            }
            else {
                switch (e.keyCode) {
                    // Escape
                    case 27:
                        stop_selecting();
                        break;
                    // 'f' = fill
                    case 70:
                        var data = {color: fg_color, alpha: alpha};
                        $.extend(data, select_box);

                        send_thing('colorful_clear', data);
                        stop_selecting();
                        break;
                    // 't' = text
                    case 84:
                        e.stopPropagation();
                        page.$("#textbook").click();
                        return false;
                    // delete = erase
                    case 46:
                        var data = $.extend({color: bg_color}, select_box);

                        send_thing('colorful_clear', data);
                        stop_selecting();
                        break;
                }

            }

        });

        setTimeout(function() {
            page.$("#overlay_canvas").focus();
        }, 100);

        page.$("#textbook").prop('disabled', true).on('click', function() {
            if (selecting && Object.keys(select_box).length > 0) {
                page.prompt("Input Text", "Input some text!", function(res) {
                    if (res && res.length > 0) {
                        var font = page.$("#font").val();
                        if (font.trim().length == 0) {
                            font = "14px serif";
                        }

                        var text = {
                            x: select_box.start_x,
                            y: select_box.start_y,
                            font: font,
                            color: fg_color,
                            alpha: alpha,
                            text: res
                        };

                        send_thing('text', text);
                    }
                    stop_selecting();
                });
            }
        });

        page.$("#shortcuts").on('click', function() {
            var cuts = ['Make sure the Canvas is selected.', 'b = Create bounding box', 'f = Fill box with foreground color',
                'del = Erase box', 't = Create text starting at top left corner.'];
            page.alert("Shortcuts", cuts.join('<br/>'));

        });
    });
};
module.exports = function() {
    "use strict";
    var canvas_handler = require('../../../shared/canvas_handler');

    var helpers = {
        rgb2hex: function(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }

            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        },

        invertColor: function(hexTripletColor) {
            var color = hexTripletColor;
            color = color.substring(1);           // remove #
            color = parseInt(color, 16);          // convert to integer
            color = 0xFFFFFF ^ color;             // invert three bytes
            color = color.toString(16);           // convert to hex
            color = ("000000" + color).slice(-6); // pad with leading zeros
            color = "#" + color;                  // prepend #
            return color;
        }
    };

    setInterval(function() {
        if (!window.opener || window.opener.closed) {
            window.close();
        }
    }, 100);

    var ui = {
        mouse: {x: 0, y: 0},
        left_mouse_button_down: false,
        pinned_x: null,
        pinned_y: null,
        hold_up: null
    };

    var board = {
        style: {
            draw_style: 'line',
            phil: true,
            fg_color: '#ffffff',
            stroke_width: 1,
            alpha: 1,
            bg_color: '#000000',
        },
        tools: {
            selecting: false,
            eye_drop: false,
            fonty: false,
            select_box: {}
        },
        my_position: {
            x: -500,
            y: -500
        },
        user_positions: {},
        using_tool: function() {
            var tools = board.tools;
            return tools.selecting || tools.eye_drop || tools.fonty;
        }
    };

    get_page('black_board', function(page) {
        $('body').append(page.$container);

        var $wait_dialog = $('<div>Syncing...</div>').dialog({
            title: "Loading",
            modal: true
        });

        var ctx = page.$("#black_board_canvas")[0].getContext('2d');
        var overlay_ctx = page.$("#overlay_canvas")[0].getContext('2d');
        ctx.strokeStyle = board.style.fg_color;

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
                    send_thing('colorful_clear', {color: board.style.bg_color, nuke: true});
                    break;

                case 'eye_drop':
                    stop_tools();
                    page.$("#overlay_canvas").addClass('eye_drop');
                    board.tools.eye_drop = true;
                    $(this).addClass('active');
                    break;

                case 'fonty':
                    stop_tools();
                    page.$("#overlay_canvas").addClass('fonty');
                    board.tools.fonty = true;
                    $(this).addClass('active');
                    break;

                default:
                    break;
            }
        });

        page.$("#fg_color").on('change', function() {
            var $match = page.$("#color_wheel .color[rgb_val='" + board.style.fg_color + "']");

            if ($match.length == 0) {
                var $last = page.$("#color_wheel .color:last").detach();
                $last.css('background', board.style.fg_color);
                $last.attr('rgb_val', board.style.fg_color);
                page.$("#color_wheel").prepend($last);
            }

            board.style.fg_color = this.value;
        });

        page.$("#bg_color").on('change', function() {
            send_thing('colorful_clear', {color: this.value, nuke: true});
        });

        page.$("#black_board_canvas").on('mouseleave', function(e) {
            ui.hold_up = setTimeout(function() {
                ui.left_mouse_button_down = false;
            }, 500);

        });

        setInterval(function() {
            if (!document.hasFocus()) {
                ui.left_mouse_button_down = false;
            }
        }, 250);

        page.$("#overlay_canvas").on('mouseup', function(e) {
            if (e.which == 1) {
                ui.left_mouse_button_down = false;
            }
        });

        page.$("#overlay_canvas").on('mousedown', function(e) {

            if (e.which == 1) {
                ui.left_mouse_button_down = true;
                ui.pinned_x = e.clientX - this.offsetLeft;
                ui.pinned_y = e.clientY - this.offsetTop;

                var end_x = ui.pinned_x;
                var end_y = ui.pinned_y;

                if (board.tools.eye_drop) {
                    var pixel = ctx.getImageData(end_x, end_y, 1, 1);
                    var rgb = 'rgb(' + pixel.data[0] + ',' + pixel.data[1] + ',' + pixel.data[2] + ')';
                    page.$("#fg_color").val(helpers.rgb2hex(rgb)).change();
                    stop_tools();
                }
                else if (board.tools.fonty) {
                    ui.left_mouse_button_down = false;
                    page.prompt("Input Text", "Input some text!", function(res) {
                        if (res && res.length > 0) {
                            var font = page.$("#font").val();
                            if (font.trim().length == 0) {
                                font = "14px serif";
                            }

                            var text = {
                                x: ui.pinned_x,
                                y: ui.pinned_y,
                                font: font,
                                color: board.style.fg_color,
                                alpha: board.style.alpha,
                                text: res
                            };

                            send_thing('text', text);
                        }
                        stop_tools();
                    });

                    // Prevent event from reaching prompt
                    return false;
                }
                else if (!board.using_tool()) {
                    if (board.style.draw_style != 'line') {
                        draw_handlers[board.style.draw_style](ui.pinned_x, ui.pinned_y);
                    }
                }

            }
        });

        setInterval(function() {
            if (Date.now() - board.my_position.last_change <= 100) {
                send_thing('position', board.my_position);
            }
        }, 100);

        var draw_handlers = {
            line: function(end_x, end_y) {
                var line = {
                    start_x: ui.pinned_x,
                    start_y: ui.pinned_y,
                    end_x: end_x,
                    end_y: end_y,
                    color: board.style.fg_color,
                    alpha: board.style.alpha,
                    line_width: board.style.stroke_width
                };

                send_thing('line', line);
            },
            rekt: function(end_x, end_y) {
                var start_x = ui.pinned_x - (board.style.stroke_width / 2);
                var start_y = ui.pinned_y - (board.style.stroke_width / 2);

                start_x = Math.floor(start_x);
                start_y = Math.floor(start_y);

                var rekt = {
                    start_x: start_x,
                    start_y: start_y,
                    color: board.style.fg_color,
                    alpha: board.style.alpha,
                    size: board.style.stroke_width,
                    phil: board.style.phil
                };

                send_thing('rekt', rekt);
            },
            circle: function(end_x, end_y) {
                var circle = {
                    start_x: ui.pinned_x,
                    start_y: ui.pinned_y,
                    color: board.style.fg_color,
                    alpha: board.style.alpha,
                    radius: board.style.stroke_width,
                    phil: board.style.phil
                };

                send_thing('circle', circle);
            }
        };

        var redraw_overlay = function() {
            overlay_ctx.clearRect(0, 0, 1280, 720);
            var select_box = board.tools.select_box;

            if (select_box && Object.keys(select_box).length > 0) {
                overlay_ctx.beginPath();
                overlay_ctx.globalAlpha = 1;
                overlay_ctx.strokeStyle = board.style.fg_color;
                overlay_ctx.setLineDash([5, 5]);
                overlay_ctx.rect(select_box.start_x, select_box.start_y, select_box.width, select_box.height);
                overlay_ctx.lineWidth = 1;
                overlay_ctx.stroke();

                overlay_ctx.beginPath();
                overlay_ctx.setLineDash([1, 1]);
                overlay_ctx.lineWidth = 1;
                overlay_ctx.strokeStyle = 'pink';
                overlay_ctx.rect(select_box.start_x - 1, select_box.start_y - 1, select_box.width + 1, select_box.height + 1);
                overlay_ctx.stroke();
            }

            var contrast_color = helpers.invertColor(board.style.bg_color);
            overlay_ctx.beginPath();
            ctx.globalAlpha = 0.5;
            overlay_ctx.font = "14px serif";
            overlay_ctx.fillStyle = contrast_color;

            for (var key in board.user_positions) {
                if (key != app.profile.username) {
                    var p = board.user_positions[key];
                    overlay_ctx.fillText(key, p.x, p.y);
                }
            }
            overlay_ctx.stroke();

            if (!ui.left_mouse_button_down && !board.using_tool()) {
                switch (board.style.draw_style) {
                    case 'rekt':
                        var start_x = ui.mouse.x - (board.style.stroke_width / 2);
                        var start_y = ui.mouse.y - (board.style.stroke_width / 2);

                        start_x = Math.floor(start_x);
                        start_y = Math.floor(start_y);

                        overlay_ctx.globalAlpha = 1;
                        overlay_ctx.beginPath();
                        overlay_ctx.lineWidth = 1;
                        overlay_ctx.strokeStyle = board.style.fg_color;
                        overlay_ctx.rect(start_x, start_y, board.style.stroke_width, board.style.stroke_width);
                        overlay_ctx.stroke();
                        break;

                    case 'circle':
                        overlay_ctx.globalAlpha = 1;
                        overlay_ctx.beginPath();
                        overlay_ctx.lineWidth = 1;
                        overlay_ctx.arc(ui.mouse.x, ui.mouse.y, board.style.stroke_width, 0, 2 * Math.PI, false);
                        overlay_ctx.strokeStyle = board.style.fg_color;
                        overlay_ctx.stroke();
                        break;
                }
            }
        };

        page.$("#overlay_canvas").on('mousemove', function(e) {
            var end_x = e.clientX - this.offsetLeft;
            var end_y = e.clientY - this.offsetTop;

            var changed = false;
            if (board.my_position.x != end_x || board.my_position.y != end_y) {
                changed = true;
            }

            board.my_position = {
                x: end_x,
                y: end_y
            };

            ui.mouse = board.my_position;

            if (changed) {
                board.my_position.last_change = Date.now();
            }

            if (board.tools.eye_drop) {
                var pixel = ctx.getImageData(end_x, end_y, 1, 1);
                var rgb = 'rgb(' + pixel.data[0] + ',' + pixel.data[1] + ',' + pixel.data[2] + ')';
                page.$("#color_preview")[0].style.background = rgb;
            }

            if (ui.left_mouse_button_down) {
                clearTimeout(ui.hold_up);

                if (board.tools.selecting) {
                    var width = Math.abs(ui.pinned_x - end_x);
                    var height = Math.abs(ui.pinned_y - end_y);
                    var start_x = Math.min(ui.pinned_x, end_x);
                    var start_y = Math.min(ui.pinned_y, end_y);

                    board.tools.select_box = {
                        start_x: start_x,
                        start_y: start_y,
                        width: width,
                        height: height
                    };
                }
                else {
                    draw_handlers[board.style.draw_style](end_x, end_y);
                    ui.pinned_x = end_x;
                    ui.pinned_y = end_y;
                }
            }
        });

        var draw_queue = [];
        window.addEventListener('message', function(e) {
            var info = e.data;
            var data = info.data;

            if (info.type == 'colorful_clear' && data.nuke) {
                board.style.bg_color = data.color;
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
                board.user_positions = info.positions;
            }

            if (info.type == 'load') {
                board.style.bg_color = info.bg_color;
            }

            if ($wait_dialog) {
                draw_queue.push(info);
                return;
            }

            ch.handle_thing(info);
        });

        var colors = ['red', 'blue', 'orange', 'green', 'black', 'white'];
        colors.forEach(function(color) {
            var $color = $('<div class="color"></div>');
            $color.css('background', color);
            page.$("#color_wheel").append($color);
            $color.attr('rgb_val', helpers.rgb2hex($color.css('backgroundColor')));
        });

        page.$("#color_wheel").on('click', '.color', function() {
            var bg_color = $(this).css('backgroundColor');
            bg_color = helpers.rgb2hex(bg_color);

            page.$("#fg_color").val(bg_color);
            board.style.fg_color = bg_color;
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
                    board.style.stroke_width = ui.value;
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
                    board.style.alpha = ui.value / 100;
                }
            }
        );

        window.opener.postMessage({action: 'load'}, app.domain);

        page.$("#buttons button[draw_style]").on('click', function() {
            $(this).siblings('button[draw_style]').removeClass('active');
            $(this).addClass('active');
            board.style.draw_style = $(this).attr('draw_style');
        });

        page.$("#phil").on('change', function() {
            board.style.phil = $(this).prop('checked');
        });

        var stop_tools = function() {
            board.tools.eye_drop = false;
            board.tools.fonty = false;
            board.tools.selecting = false;
            board.tools.select_box = {};

            page.$("#overlay_canvas").removeClass('eye_drop fonty');
            page.$("#controls [menu_item='eye_drop" + "']").removeClass('active');
            page.$("#controls [menu_item='fonty" + "']").removeClass('active');

            page.$("#rect_tool").removeClass('active');
        };

        page.$("#rect_tool").on('click', function() {
            $(this).toggleClass('active');
            board.tools.selecting = $(this).hasClass('active');

            if (!board.tools.selecting) {
                stop_tools();
            }
        });

        page.$("#overlay_canvas").on('keydown', function(e) {
            if (!board.tools.selecting) {
                switch (e.keyCode) {
                    // 'b'
                    case 66:
                        page.$("#rect_tool").click();
                        break;

                    // 'c'
                    case 67:
                        page.$("[menu_item='eye_drop']").click();
                        break;

                    // Escape
                    case 27:
                        stop_tools();
                        break;

                    // 't' = text
                    case 84:
                        page.$("[menu_item='fonty']").click();
                        return false;

                    default:
                        break;
                }
            }
            else {
                switch (e.keyCode) {
                    // Escape
                    case 27:
                        stop_tools();
                        break;
                    // 'f' = fill
                    case 70:
                        var data = {color: board.style.fg_color, alpha: board.style.alpha};
                        $.extend(data, board.tools.select_box);

                        send_thing('colorful_clear', data);
                        stop_tools();
                        break;
                    // delete = erase
                    case 46:
                        var data = $.extend({color: board.style.bg_color}, board.tools.select_box);

                        send_thing('colorful_clear', data);
                        stop_tools();
                        break;
                }

            }

        });

        setTimeout(function() {
            page.$("#overlay_canvas").focus();
        }, 100);


        page.$("#shortcuts").on('click', function() {
            var cuts = ['Make sure the Canvas is selected.', 'b = Create bounding box', 'f = Fill box with foreground color',
                'del = Erase box', 't = Create text starting at top left corner.', 'c = Eyedrop shortcut.'];
            page.alert("Shortcuts", cuts.join('<br/>'));
        });

        page.$("#save").on('click', function() {
            page.$("#black_board_canvas")[0].toBlob(function(blob) {
                if (page.blob_url) {
                    URL.revokeObjectURL(page.blob_url);
                }

                // Taken from FileSaver.js
                page.blob_url = URL.createObjectURL(blob);
                var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                save_link.href = page.blob_url;
                save_link.download = 'canvas.png';
                var event = new MouseEvent("click");
                save_link.dispatchEvent(event);
            });
        });

        var render_wrapper = function render_wrapper() {
            redraw_overlay();
            requestAnimationFrame(render_wrapper);
        };

        render_wrapper();
    });
};
module.exports = function() {
    get_page('black_board', function(page) {
        $('body').append(page.$container);

        var ctx = page.$("#black_board_canvas")[0].getContext('2d');
        ctx.strokeStyle = "#FF0000";

        var resize_canvas = function() {
            var width = 1280;
            var height = 720;
            page.$("#black_board_canvas").attr({width: width, height: height});
        };

        resize_canvas();
        // $(window).on('resize', resize_canvas);

        var send_thing = function(type, data) {
            var message = {action: 'draw', type: type, data: data};
            window.opener.postMessage(message, app.domain);
        };

        var pinned_x = null;
        var pinned_y = null;
        var left_mouse_down = false;

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

        page.$("#black_board_canvas").on('mousedown', function(e) {
            // probably the LMB?
            if (e.which == 1) {
                left_mouse_down = true;
                pinned_x = e.clientX - this.offsetLeft;
                pinned_y = e.clientY - this.offsetTop;

                var r = 0;
                var g = 0;
                var b = 0;
                var a = 255;
                var size = 5;

                var x = pinned_x;
                var y = pinned_y;

                ctx.beginPath();
                ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
                ctx.fillRect(x, y, size, size);
                ctx.stroke();

                var rekt = {
                    r: r,
                    g: g,
                    b: b,
                    a: a,
                    x: pinned_x,
                    y: pinned_y,
                    size: 5
                };

                send_thing('rekt', rekt);
            }
        });

        page.$("#black_board_canvas").on('mousemove', function(e) {
            if (left_mouse_down) {
                left_mouse_down = true;
                var end_x = e.clientX - this.offsetLeft;
                var end_y = e.clientY - this.offsetTop;

                var line = {
                    start_x: pinned_x,
                    start_y: pinned_y,
                    end_x: end_x,
                    end_y: end_y
                };

                ctx.beginPath();
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
            console.log(info);

            if (info.type != 'load') {
                if (info.username == app.profile.username) {
                    return;
                }
            }

            switch (info.type) {
                case 'load':
                    ctx.clearRect(0, 0, 1280, 720);

                    var image = new Image();
                    image.onload = function() {
                        ctx.drawImage(image, 0, 0);
                    };

                    image.src = info.data_src;
                    break;

                case 'line':
                    ctx.beginPath();
                    var r = 0, g = 0, b = 0, a = 255;
                    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
                    ctx.moveTo(data.start_x, data.start_y);
                    ctx.lineTo(data.end_x, data.end_y);
                    ctx.stroke();
                    break;

                case 'rekt':
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(" + data.r + "," + data.g + "," + data.b + "," + (data.a / 255) + ")";
                    ctx.fillRect(data.x, data.y, data.size, data.size);
                    ctx.stroke();
                    break;

                case 'great_clear':
                    // Blame?
                    ctx.clearRect(0, 0, 1280, 720);
                    break;

                default:
                    break;
            }
        });

        setInterval(function() {
            if (!window.opener || window.opener.closed) {
                window.close();
            }
        }, 100);

        window.opener.postMessage({action: 'load'}, app.domain);
    });
};
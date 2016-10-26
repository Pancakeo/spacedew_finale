module.exports = function() {
    // TODO - better support for Canvas not existing.
    try {
        var Canvas = require('canvas');
    }
    catch (e) {
        return {
            canvas: {
                toDataURL: function() {

                }
            },
            handle_thing: function() {

            },
            mini: {
                canvas: {
                    toDataURL: function() {

                    }
                }
            }
        };
    }

    var canvas = new Canvas(1280, 720);
    var ctx = canvas.getContext('2d');
    var canvas_handler = require(app.shared_root + '/canvas_handler');

    var set_background = function(ctx, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1280, 720);
        ctx.stroke();
    };

    var mini_canvas = new Canvas(256, 144);
    var mini_ctx = mini_canvas.getContext('2d');
    mini_ctx.scale(0.2, 0.2);

    set_background(ctx, 'black');
    set_background(mini_ctx, 'black');

    var ch = canvas_handler(ctx);
    var mini_ch = canvas_handler(mini_ctx);

    var tent = {
        canvas: canvas,
        ctx: ctx,
        bg_color: '#000000',
        handle_thing: function(info) {
            if (info.type == 'colorful_clear') {
                tent.bg_color = info.data.color;
            }

            ch.handle_thing(info);
            mini_ch.handle_thing(info);
        },
        mini: {
            canvas: mini_canvas,
            ctx: mini_ctx
        }
    };

    return tent;
};

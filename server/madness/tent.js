module.exports = function() {
    var Canvas = require('canvas');
    var canvas = new Canvas(1280, 720);
    var ctx = canvas.getContext('2d');
    var canvas_handler = require(app.shared_root + '/canvas_handler');

    var mini_canvas = new Canvas(256, 144);
    var mini_ctx = mini_canvas.getContext('2d');
    mini_ctx.scale(0.2, 0.2);

    var ch = canvas_handler(ctx);
    var mini_ch = canvas_handler(mini_ctx);

    var tent = {
        canvas: canvas,
        ctx: ctx,
        handle_thing: function(data) {
            ch.handle_thing(data);
            mini_ch.handle_thing(data);
        },
        mini: {
            canvas: mini_canvas,
            ctx: mini_ctx
        }
    };

    return tent;
};
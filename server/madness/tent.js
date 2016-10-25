module.exports = function() {
    var Canvas = require('canvas');
    var canvas = new Canvas(1280, 720);
    var ctx = canvas.getContext('2d');

    var mini_canvas = new Canvas(256, 144);
    var mini_ctx = mini_canvas.getContext('2d');
    mini_ctx.scale(0.2, 0.2);

    var wupwoahheh = function(ctx, info) {
        var data = info.data;

        switch (info.type) {
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
    };


    var tent = {
        canvas: canvas,
        ctx: ctx,
        handle_thing: function(data) {
            wupwoahheh(tent.ctx, data);
            wupwoahheh(tent.mini.ctx, data);
        },
        mini: {
            canvas: mini_canvas,
            ctx: mini_ctx
        }
    };

    return tent;
};
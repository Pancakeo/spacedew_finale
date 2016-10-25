module.exports = function(ctx) {
    var handler = {};

    // ctx.lineCap = 'round';

    handler.handle_thing = function(info) {
        var data = info.data;

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
                ctx.moveTo(data.start_x, data.start_y);
                ctx.strokeStyle = data.color;
                ctx.lineWidth = data.line_width || 1;
                ctx.lineTo(data.end_x, data.end_y);
                ctx.stroke();
                break;

            case 'rekt':
                ctx.beginPath();
                ctx.fillStyle = data.color;
                ctx.fillRect(data.x, data.y, data.size, data.size);
                ctx.stroke();
                break;

            case 'colorful_clear':
                ctx.beginPath();
                ctx.fillStyle = data.color;
                ctx.fillRect(0, 0, 1280, 720);
                ctx.stroke();
                break;

            case 'great_clear':
                ctx.clearRect(0, 0, 1280, 720);
                break;

            default:
                break;
        }

    };

    return handler;
};
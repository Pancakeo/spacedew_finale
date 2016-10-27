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
                    ctx.globalAlpha = 1;
                    ctx.drawImage(image, 0, 0);
                };

                image.src = info.data_src;
                break;

            case 'line':
                ctx.beginPath();
                ctx.moveTo(data.start_x, data.start_y);
                ctx.strokeStyle = data.color;
                ctx.globalAlpha = data.alpha;
                ctx.lineWidth = data.line_width;
                ctx.lineTo(data.end_x, data.end_y);
                ctx.stroke();
                break;

            case 'rekt':
                ctx.beginPath();
                ctx.globalAlpha = data.alpha;
                ctx.strokeStyle = data.color;
                ctx.lineWidth = 1;
                ctx.rect(data.start_x, data.start_y, data.size, data.size);
                ctx.stroke();

                if (data.phil) {
                    ctx.fillStyle = data.color;
                    ctx.fill();
                }
                break;

            case 'circle':
                ctx.beginPath();
                ctx.globalAlpha = data.alpha;
                ctx.arc(data.start_x, data.start_y, data.radius, 0, 2 * Math.PI, false);

                if (data.phil) {
                    ctx.fillStyle = data.color;
                    ctx.fill();
                }

                ctx.lineWidth = 1;
                ctx.strokeStyle = data.color;
                ctx.stroke();
                break;

            case 'colorful_clear':
                ctx.beginPath();
                ctx.globalAlpha = 1;
                ctx.strokeStyle = data.color;
                ctx.fillStyle = data.color;

                if (data.nuke) {
                    ctx.clearRect(0, 0, 1280, 720);
                    ctx.fillRect(0, 0, 1280, 720);
                }
                else {
                    ctx.clearRect(data.start_x, data.start_y, data.width, data.height);
                    ctx.fillRect(data.start_x, data.start_y, data.width, data.height);
                }

                ctx.stroke();
                break;

            default:
                break;
        }

    };

    return handler;
};
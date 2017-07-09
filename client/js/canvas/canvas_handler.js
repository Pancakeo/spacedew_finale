module.exports = function(ctx) {
    var handler = {};

    // ctx.lineCap = 'round';

    handler.handle_thing = function(data) {

        switch (data.type) {
            case 'line':
                ctx.beginPath();
                ctx.lineCap = "round";
                ctx.strokeStyle = data.color;
                ctx.globalAlpha = data.alpha;
                ctx.lineWidth = data.line_width;
                ctx.moveTo(data.start_x, data.start_y);
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

            case 'text':
                ctx.beginPath();
                ctx.globalAlpha = data.alpha;
                ctx.font = data.font;
                ctx.fillStyle = data.color;
                ctx.fillText(data.text, data.x, data.y);
                ctx.stroke();
                break;

            case 'colorful_clear':
                ctx.beginPath();
                var alpha = 1;
                if (data.alpha != null) {
                    alpha = data.alpha;
                }

                ctx.globalAlpha = alpha;
                ctx.strokeStyle = data.color;
                ctx.fillStyle = data.color;

                if (data.nuke) {
                    ctx.rect(0, 0, 1280, 720);
                }
                else {
                    ctx.rect(data.start_x, data.start_y, data.width, data.height);
                }

                ctx.fill();
                ctx.stroke();

                break;

            default:
                break;
        }

    };

    return handler;
};
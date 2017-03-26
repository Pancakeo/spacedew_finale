module.exports = function(room) {
    var zlib = require('zlib');

    let bob_ross = {
        paths: [],
        bg_color: '#000000',

        // return a compressed version of paths
        sync: function(session) {
            let path_buffer = Buffer.from(JSON.stringify(bob_ross.paths));

            zlib.deflate(path_buffer, function(err, res) {
                session.send_buffer(res, {room_id: room.id, bg_color: bob_ross.bg_color, type: 'blackboard'});
            });

            return bob_ross.paths;
        },
        handle_thing: function(info) {
            if (info.type != 'position' && info.type != 'colorful_clear') {
                bob_ross.paths.push(info);
            }

        },
        clear: function(bg_color) {
            bob_ross.bg_color = bg_color;
            bob_ross.paths.length = 0;
        }

    };

    return bob_ross;
};
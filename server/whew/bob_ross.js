module.exports = function() {
    let bob_ross = {
        paths: [],
        bg_color: '#000000',
        dirty: false,

        // return a compressed version of paths
        compress: function() {
            return bob_ross.paths;
        },
        handle_thing: function(info) {
            if (info.type != 'position' && info.type != 'colorful_clear') {
                bob_ross.paths.push(info);
            }

        },
        clear: function(bg_color) {
            console.log(bg_color);
            bob_ross.bg_color = bg_color;
            bob_ross.paths.length = 0;
        }

    };

    return bob_ross;
};
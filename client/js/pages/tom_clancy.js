module.exports = function() {
    var tom_clancy = {};

    get_page('tom_clancy', function(page) {
        $('div').not('#tom_clancy').remove();
        $('body').append(page.$container);

        var do_resize = function() {
            var height = window.innerHeight - 30;
            page.$('#content').height(height);
        };

        window.addEventListener('resize', function(e) {
            do_resize();
        });

        do_resize();

        var pstyle = 'border: 1px solid #dfdfdf; padding: 5px;';
        $('#content').w2layout({
            name: 'layout',
            panels: [
                {type: 'top', size: 50, style: pstyle, content: page.$("#top"), resizable: true},
                {type: 'left', size: '90%', style: pstyle, content: page.$("#left_pane"), resizable: true},
                {type: 'main', style: pstyle, content: page.$("#right_pane"), resizable: true}
            ]
        });

        tom_clancy.game = require('./game')(page.$('#game_wrapper'));
        tom_clancy.users = require('./users')(page.$('#users_wrapper'));
        tom_clancy.chatterbox = require('./chatterbox')(page.$('#chatterbox_wrapper'));

        page.$("#logout").on('click', function() {
            delete localStorage.auth_key;
            window.location = '/';
        });
    });
};
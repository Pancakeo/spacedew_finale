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

        var pstyle = 'border: 1px solid #dfdfdf;';
        $('#content').w2layout({
            name: 'layout',
            panels: [
                {type: 'top', size: 35, style: pstyle, content: page.$("#top"), resizable: false},
                {type: 'left', size: '88%', style: pstyle, content: page.$("#left_pane"), resizable: true},
                {type: 'main', style: pstyle, content: page.$("#right_pane"), resizable: true}
            ]
        });

        tom_clancy.chatterbox = require('./chatterbox')(page.$('#left_pane'));
        tom_clancy.users = require('./users')(page.$('#right_pane'));

        page.$("img[menu_item='logout']").on('click', function() {
            delete localStorage.auth_key;
            window.location = '/';
        });
    });
};
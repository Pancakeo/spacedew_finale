module.exports = function() {

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

        require('./chatterbox')(page.$('#left_pane'));
        require('./users')(page.$('#right_pane'));

        var top_menu_handlers = {
            logout: function() {
                delete localStorage.auth_key;
                window.location = '/';
            },
            timestamps: function() {
                $(this).toggleClass('active');
                page.$("#chat").toggleClass('show_timestamps');
            }
        };

        page.$("#button_jar").on('click', 'img[menu_item]', function() {
            var menu_item = $(this).attr('menu_item');

            if (top_menu_handlers[menu_item] != null) {
                top_menu_handlers[menu_item].call(this);
            }

        });

    });
};
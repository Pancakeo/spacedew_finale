module.exports = function() {

    var toolio = require('../app/toolio');
    var ws = require('../app/wupsocket');

    var generic_outfit = {
        chat: {
            username_color: '#0000FF',
            fg_color: '#000000',
            bg_color: '#FFFFFF',
            font_family: 'Verdana',
            font_size: 14
        }
    };

    var user_outfit = app.world.user_settings[app.profile.username];
    user_outfit = $.extend(true, {}, generic_outfit, user_outfit.outfit);
    var original_outfit = toolio.copy_object(user_outfit);

    get_page('dress_up', function(page) {
        var $dialog = page.$container.dialog({
            title: 'Dress Up',
            width: 600,
            resizable: false,
            modal: true,
            buttons: {
                'Save': function() {
                    ws.send('user_settings', 'outfit', {outfit: user_outfit});
                    $(this).dialog('close');
                },
                'Default': function() {
                    apply_settings(true, generic_outfit);
                },
                'Reset': function() {
                    apply_settings(true);
                },
                'Cancel': function() {
                    $(this).dialog('close');
                }
            },
            open: function() {
                setTimeout(function() {
                    page.init();
                }, 0);
            }
        });

        page.init = function() {
            $dialog.find('#dress_tabs').tabs();

            ['Arial', 'Verdana', 'Tahoma', 'Webdings', 'Courier New'].forEach(function(font_family) {
                page.$("#font_family").append('<option>' + font_family + '</option>');
            });

            [8, 9, 10, 11, 12, 13, 14].forEach(function(size) {
                page.$("#font_size").append('<option>' + size + '</option>');
            });

            page.$("#chat_style input, select").on('change', function() {
                var key = $(this).attr('id');
                user_outfit.chat[key] = $(this).val();
                apply_settings();
            });

            apply_settings(true);
        };

        var apply_settings = function(load, load_from) {
            if (load) {
                if (load_from == null) {
                    user_outfit = toolio.copy_object(original_outfit);
                }
                else {
                    user_outfit = toolio.copy_object(load_from);
                }


                for (var key in user_outfit.chat) {
                    page.$("#" + key).val(user_outfit.chat[key]);
                }
            }

            page.$("#example_wrapper").css({
                background: user_outfit.chat.bg_color,
                color: user_outfit.chat.fg_color,
                fontSize: user_outfit.chat.font_size + 'px',
                fontFamily: user_outfit.chat.font_family
            });

            page.$("#example_username").css({
                color: user_outfit.chat.username_color
            });
        }
    });

    return {};
};
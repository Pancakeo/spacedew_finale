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
        },
        user: {
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
            $dialog.find('#example_username').text(app.profile.username + ':');
            $dialog.find('#ul_example').text(app.profile.username);
            $dialog.find('#dress_tabs').tabs();

            ['Arial', 'Verdana', 'Tahoma', 'Webdings', 'Comic Sans MS', 'Calibri', 'Georgia', 'Impact', 'Lucida Console', 'Papyrus'].sort().forEach(function(font_family) {
                var $choice = $('<option>' + font_family + '</option>').prop('code', font_family);
                page.$("#chat_style #font_family").append($choice);

                var $choice = $('<option>' + font_family + '</option>').prop('code', font_family);
                page.$("#user_list_style #font_family").append($choice);
            });

            [12, 13, 14, 15, 16, 17, 18].forEach(function(size) {
                var $choice = $('<option>' + size + '</option>').prop('code', size);
                page.$("#chat_style #font_size").append($choice);

                var $choice = $('<option>' + size + '</option>').prop('code', size);
                page.$("#user_list_style #font_size").append($choice);
            });

            page.$("#chat_style").find("input").on('change', function() {
                var key = $(this).attr('id');
                user_outfit.chat[key] = $(this).val();
                apply_settings();
            });

            page.$("#chat_style").find("select").on('change', function() {
                var key = $(this).attr('id');
                var code = $(this).find(':selected').prop('code');
                user_outfit.chat[key] = code;
                apply_settings();
            });

            page.$("#user_list_style").find("input").on('change', function() {
                var key = $(this).attr('id');
                user_outfit.user[key] = $(this).val();
                apply_settings();
            });

            page.$("#user_list_style").find("select").on('change', function() {
                var key = $(this).attr('id');
                var code = $(this).find(':selected').prop('code');
                user_outfit.user[key] = code;
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
                    page.$("#chat_style #" + key).val(user_outfit.chat[key]);
                }

                for (var key in user_outfit.user) {
                    page.$("#user_list_style #" + key).val(user_outfit.user[key]);
                }
            }

            page.$("#chat_style #example_wrapper").css({
                background: user_outfit.chat.bg_color,
                color: user_outfit.chat.fg_color,
                fontSize: user_outfit.chat.font_size + 'px',
                fontFamily: user_outfit.chat.font_family
            });

            page.$("#chat_style #example_username").css({
                color: user_outfit.chat.username_color
            });

            page.$("#user_list_style #ul_example").css({
                background: user_outfit.user.bg_color,
                color: user_outfit.user.fg_color,
                fontSize: user_outfit.user.font_size + 'px',
                fontFamily: user_outfit.user.font_family
            })
        }
    });

    return {};
};
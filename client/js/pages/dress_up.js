module.exports = function() {

    var toolio = require('../app/toolio');
    var ws = require('../app/wupsocket');
    var default_emus = require('../app/default_emus');

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
        },
        holy_cow: default_emus
    };

    var user_outfit = app.world.user_settings[app.profile.username];
    user_outfit = $.extend(true, {}, generic_outfit, user_outfit.outfit);
    var original_outfit = toolio.copy_object(user_outfit);

    get_page('dress_up', function(page) {
            var $dialog = page.$container.dialog({
                title: 'Dress Up',
                width: 800,
                height: 650,
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

                var $emus = page.$("#holy_cows #emu_things tbody");
                var numpad_keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

                var $emu_dropdown = $('<select class="emu_dropdown" id="emu_dropdown"/>');
                app.emu_list.forEach(function(emu) {
                    $emu_dropdown.append('<option>' + emu + '</option>');
                });

                for (var key in numpad_keys) {
                    var $choice = page.get_template('emu_row');
                    $choice.find('#key_code').text(key);
                    $choice.find('select').replaceWith($emu_dropdown.clone());
                    $emus.append($choice);
                }

                page.$("#emu_things .emu_row").on('change', 'input, select', function() {
                    var control = $(this).attr('id');
                    var row = $(this).closest('.emu_row').index();

                    switch (control) {
                        case 'emu_dropdown':
                            user_outfit.holy_cow[row].text = $(this).val();
                            break;
                        case 'team_play':
                            var checked = $(this).prop('checked');
                            user_outfit.holy_cow[row].team_play = checked;
                            break;

                        default:
                            break;
                    }
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

                    page.$("#emu_things .emu_row").each(function(idx) {
                        var $row = $(this);
                        var emu = user_outfit.holy_cow[idx];
                        if (emu) {
                            $row.find('#emu_dropdown').val(emu.text);
                            var team_play = (emu.team_play == true);
                            $row.find('#team_play').prop('checked', team_play);
                        }
                    });

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
        }
    );

    return {};
}
;
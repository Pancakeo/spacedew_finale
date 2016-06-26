module.exports = function(options) {

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

        var chatterbox = require('./chatterbox')(page.$('#left_pane'), options);
        require('./users')(page.$('#right_pane'));

        page.$("#composer").on('keypress', function(e) {
            if (e.which === 13) {
                var message = $(this).val();

                if (message.length > 0) {
                    var room_id = app.get_active_room(true);
                    page.send('chat', {message: message, room_id: room_id}, {page_name: 'chatterbox'});
                }

                $(this).val('');
            }
        });

        $("#composer").on('paste', function(event) {
            // Adapted from https://stackoverflow.com/questions/6333814/how-does-the-paste-image-from-clipboard-functionality-work-in-gmail-and-google-c/15369753#15369753
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;

            var multi_line_text = event.originalEvent.clipboardData.getData("text");
            if (multi_line_text.indexOf('\n') > 0 || multi_line_text.length > 140) {
                require('./blargher')(multi_line_text);
                return false;
            }

            if (items == null) {
                return;
            }

            var blob = null;
            var file_type;

            for (var i = 0; i < items.length; i++) {

                if (items[i].type.indexOf("image") === 0) {
                    var file_type = items[i].type;
                    blob = items[i].getAsFile();
                    break;
                }
            }

            if (blob != null) {
                var blob_url = URL.createObjectURL(blob);

                var reader = new FileReader();
                reader.onload = function() {
                    $("<div>The following blerb will be blurghled:<br/><img style='max-width: 300px; max-height: 300px;'/></div>").dialog({
                        title: 'Confirm Paste',
                        modal: true,
                        width: "auto",
                        open: function() {
                            $(this).find('img')[0].src = blob_url;
                        },
                        close: function() {
                            URL.revokeObjectURL(blob_url);
                        },
                        buttons: {
                            'Send': function() {
                                var transfer_id = page.toolio.generate_id();
                                
                                var ext = '';
                                if (file_type != null && file_type.indexOf('/') >= 0) {
                                    ext = file_type.split('/')[1];
                                }

                                var meta = toolio.get_meta({size: reader.result.byteLength, type: file_type, name: 'clipboard_' + transfer_id + '.' + ext});

                                var active_tab = tab_guy.get_active_tab();
                                meta.room_id = active_tab.id;

                                binary_client.send_buffer(reader.result, meta);
                                URL.revokeObjectURL(blob_url);

                                $(this).dialog('close');
                            },
                            'Cancel': function() {
                                $(this).dialog('close');
                            }
                        },
                        destroy: function() {
                            $(this).dialog('destroy');
                        }
                    });
                };

                reader.readAsArrayBuffer(blob);
            }
        });


        var menu_handlers = {
            logout: function() {
                delete localStorage.auth_key;
                window.location = '/';
            },
            timestamps: function() {
                $(this).toggleClass('active');
                page.$(".chat_thing").toggleClass('show_timestamps');
            },
            notify: function() {
                var active = $(this).hasClass('active');
                $(this).removeClass('active');
                localStorage.auto_notify = false;
                app.settings.notify = false;

                var _this = this;

                if (!active) {
                    Notification.requestPermission(function(permission) {
                        app.settings.notify = (permission == "granted");

                        if (app.settings.notify) {
                            localStorage.auto_notify = true;
                            $(_this).addClass('active');
                            page.alert("Notifications", "Notifications are now turned on.");
                        }
                        else {
                            page.alert("Notifications", "Desolee. Failed to activate Notifications. May have been disabled for this domain previously.");
                        }
                    });
                }
                else {
                    page.alert("Notifications", "Notifications are now turned off.");
                }
            },
            scroll_lock: function() {
                $(this).toggleClass('active');
                app.settings.scroll_lock = $(this).hasClass('active');
            },
            dress_up: function() {
                require('./dress_up')();
            },
            blargher: function() {
                require('./blargher')();
            },
            browse: function() {
                page.$("#browse_file_thing").click();
            },
            toggle_user_pane: function() {
                $(this).toggleClass('active');

                page.$("#left_pane").toggleClass('no_user_pane');
                page.$("#right_pane").toggleClass('no_user_pane');
            },
            change_password: function() {
                require('./change_password')();
            },
            wrenches: function() {
                require('./wrenches')();
            }
        };

        // Turn on Notifications if already set.
        if (Boolean(localStorage.auto_notify) == true) {
            Notification.requestPermission(function(permission) {
                app.settings.notify = (permission == "granted");
                if (app.settings.notify) {
                    page.$("#button_jar img[menu_item='notify']").addClass('active');
                }
            });
        }

        page.$container.on('click', 'img[menu_item]', function() {
            var menu_item = $(this).attr('menu_item');

            if (menu_handlers[menu_item] != null) {
                menu_handlers[menu_item].call(this);
            }
        });

        page.$("#room_names").on('click', '.room_tab', function() {
            var $active = page.$("#room_names .room_tab.active");
            if ($active.length == 1 && $active.attr('room_id') != $(this).attr('room_id')) {
                $active.prop('room_box').hide();
            }

            page.$("#room_names .room_tab").removeClass('active');
            $(this).addClass('active');
            $(this).prop('room_box').show();
        });

        page.$("#room_names").on('dblclick', '.room_tab', function() {
            var room_id = $(this).prop('room').id;

            page.prompt("Room Name", "Maybe input a room name here:", $(this).text(), function(val) {
                if (val != null) {
                    val = val.trim();
                    if (val.length > 0) {
                        page.emit('change_room_name', {name: val, room_id: room_id});
                    }
                }
            });
        });

        app.rename_room_tab = function(room_id, room_name) {
            page.$('#room_names [room_id="' + room_id + '"]').html(room_name).attr('title', room_name);
        };

        app.add_room_tab = function(room, add_options) {
            add_options = $.extend({
                focus: false
            }, add_options);

            var $room_tab = $('<div class="room_tab" room_id="' + room.id + '"/>');
            $room_tab.attr('title', room.name).html(room.name);

            var $room_box = $('<div class="chat_thing" room_id="' + room.id + '"></div>');
            $room_tab.prop('room', room);

            $room_box.on('click', '.blargh .close', function() {
                $(this).closest('.blargh').remove();
            });

            $room_box.on('click', '.link_box .remove', function() {
                $(this).closest('.link_box').remove();
            });

            // May actually not need these:
            $room_box.prop('room_tab', $room_tab);
            $room_tab.prop('room_box', $room_box);

            page.$("#room_names").append($room_tab);
            page.$("#chat_rooms").append($room_box);

            if (add_options.focus == true) {
                $room_tab.click();
            }
        };

        app.get_active_room = function(just_id) {
            var $active = page.$("#room_names .room_tab.active");

            // uh oh
            if ($active.length == 0) {
                throw 'heh';
            }

            if (just_id) {
                return $active.attr('room_id');
            }
            else {
                return $active.prop('room');
            }
        };

        page.peepy('users.user_settings', function(params) {
            var my_settings = params.user_settings[app.profile.username];
            my_settings = my_settings && my_settings.outfit && my_settings.outfit.chat;

            if (my_settings) {
                var composer_style = {
                    fg_color: 'black',
                    bg_color: 'white',
                    font_size: 14,
                    font_family: 'Verdana'
                };

                my_settings = $.extend({}, composer_style, my_settings);

                page.$("#composer").css({
                    color: my_settings.fg_color,
                    background: my_settings.bg_color,
                    fontSize: my_settings.font_size,
                    fontFamily: my_settings.font_family
                })
            }
        });
    });
};
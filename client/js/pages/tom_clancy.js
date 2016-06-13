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

        require('./chatterbox')(page.$('#left_pane'), options);
        require('./users')(page.$('#right_pane'));

        var menu_handlers = {
            logout: function() {
                delete localStorage.auth_key;
                window.location = '/';
            },
            timestamps: function() {
                $(this).toggleClass('active');
                page.$("#chat").toggleClass('show_timestamps');
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

        page.$("#room_names")

        app.add_room_tab = function(room, focus) {
            var $room_tab = $('<div class="room_tab" room_id="' + room.id + '">' + room.name + '</div>');
            var $room_box = $('<div class="chat_thing"></div>');
            $room_tab.prop('room', room);

            // May actually not need these:
            $room_box.prop('room_tab', $room_tab);
            $room_tab.prop('room_box', $room_box);

            page.$("#room_names").append($room_tab);
            page.$("#chat_rooms").append($room_box);

            if (focus == true) {
                $room_tab.click();
            }
        };

    });
};
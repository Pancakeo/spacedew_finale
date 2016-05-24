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

        page.$("#button_jar").on('click', 'img[menu_item]', function() {
            var menu_item = $(this).attr('menu_item');

            if (top_menu_handlers[menu_item] != null) {
                top_menu_handlers[menu_item].call(this);
            }
        });

    });
};
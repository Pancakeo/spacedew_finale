module.exports = function($parent) {
    get_page('chatterbox', function(page) {
        var event_bus = require('../../../shared/event_bus');

        $parent.append(page.$container);
        var $chat = page.$("#chat");

        // TODO - check if page is focused. Hide after x seconds. Return to window.
        var show_notification = function(message) {

            if (app.settings.notify === true && app.hidden) {
                var n = new Notification(message);

                n.onclick = function() {
                    window.focus();
                    n.close();
                };

                setTimeout(function() {
                    n.close();
                }, 2500);
            }
        };

        var append_system = function(message, class_name) {
            var $message = $('<div class="message"><span class="timestamp">[' + moment().format("h:mm:ss A") + ']</span>' + message + '</div>');
            $message.addClass(class_name);
            $chat.append($message);

            show_notification(message);

            if (app.settings.scroll_lock !== true) {
                $message[0].scrollIntoView();
            }
        };

        var append_chat = function(data) {
            var $message = $('<div class="message"><span class="timestamp">[' + moment().format("h:mm:ss A") + ']</span><span class="username">' + data.username + ':</span>' + data.message + '</div>');
            $chat.append($message);
            show_notification(data.message);

            if (app.settings.scroll_lock !== true) {
                $message[0].scrollIntoView();
            }
        };

        event_bus.on('users.roams_the_earth', function(user) {
            append_system(user.username + " roams the earth.", 'happy')
        });

        event_bus.on('users.has_gone_to_a_better_place', function(user) {
            append_system(user.username + " has gone to a better place.", 'sad')
        });

        page.listen('chat', function(data) {
            append_chat(data);
        });

        page.$("#composer").on('keypress', function(e) {
            if (e.which === 13) {
                var message = $(this).val();

                if (message.length != null) {
                    page.send('chat', {message: message});
                }

                $(this).val('');
            }
        })
    });

    return {};
};
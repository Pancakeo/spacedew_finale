module.exports = function($parent) {
    get_page('chatterbox', function(page) {
        var event_bus = require('../../../shared/event_bus');

        $parent.append(page.$container);
        var $chat = page.$("#chat");

        // TODO - check if page is focused. Hide after x seconds. Return to window.
        var show_notification = function(message) {

            if (app.hidden) {
                if (app.settings.notify === true) {
                    var n = new Notification(message);

                    n.onclick = function() {
                        window.focus();
                        n.close();
                    };

                    setTimeout(function() {
                        n.close();
                    }, 2500);
                }

                // Do the favicon thing.
                if (app.new_message_alert !== true) {
                    $('#favicon').attr('href', '/images/favicon-alert.png');
                    app.new_message_alert = true;

                    $(window).one('focus', function() {
                        app.new_message_alert = false;
                        $('#favicon').attr('href', '/images/favicon-normal.png');
                    });
                }
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

            var message = data.message;
            var link_replacement = '<a target="_blank" href="\$1">\$1</a>';

            var lines = message.split('<br/>');
            message = '';

            lines.forEach(function(line) {
                var parts = line.split(/\s/);

                // Consider a more robust link parser.
                for (var i = 0; i < parts.length; i++) {
                    parts[i] = parts[i].replace(/(http.*)/, link_replacement);
                }

                if (message == '') {
                    message = parts.join(' ');
                }
                else {
                    message += '<br/>' + parts.join(' ');
                }

            });

            var $message = $('<div class="message"><span class="timestamp">[' + moment().format("h:mm:ss A") + ']</span><span class="username">' + data.username + ':</span>' + message + '</div>');
            $chat.append($message);
            show_notification(data.username + ": " + data.message);

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
module.exports = function($parent, options) {
    get_page('chatterbox', function(page) {
        var event_bus = require('../../../shared/event_bus');

        $parent.append(page.$container);

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

        var append_custom = function($blargh, append_options) {
            append_options = $.extend({
                room_id: null
            }, append_options);

            if (typeof($blargh) == "string") {
                $blargh = $('<div>' + $blargh + '</div>');
            }

            var $chat = page.$("div[room_id='" + append_options.room_id + "']");
            $chat.append($blargh);

            show_notification("New multi-line message received!");

            if (app.settings.scroll_lock !== true) {
                $blargh[0].scrollIntoView();
            }
        };

        var append_system = function(message, append_options) {
            append_options = $.extend({
                room_id: null,
                class_name: null
            }, append_options);

            if (append_options.room_id == null) {
                return;
            }

            var $chat = page.$("div[room_id='" + append_options.room_id + "']");
            var $message = $('<div class="message"><span class="timestamp">[' + moment().format("h:mm:ss A") + ']</span>' + message + '</div>');
            $message.addClass(append_options.class_name);
            $chat.append($message);

            show_notification(message);

            if (app.settings.scroll_lock !== true) {
                $message[0].scrollIntoView();
            }
        };

        var append_chat = function(data) {
            if (data.room_id == null) {
                return;
            }

            var $chat = page.$("div[room_id='" + data.room_id + "']");
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

            var $message = $('<div class="message"><span class="timestamp">[' + moment().format("h:mm:ss A") + ']</span><span class="username">' + data.username + ': </span>' + message + '</div>');
            $chat.append($message);
            show_notification(data.username + ": " + data.message);

            if (app.settings.scroll_lock !== true) {
                $message[0].scrollIntoView();
            }
        };

        event_bus.on('users.roams_the_earth', function(event) {
            append_system(event.username + " roams the earth.", {class_name: 'happy', room_id: event.room_id})
        });

        event_bus.on('users.has_gone_to_a_better_place', function(event) {
            append_system(event.username + " has gone to a better place.", {class_name: 'sad', room_id: event.room_id})
        });

        event_bus.on('blargher.send', function(params) {
            var room_id = app.get_active_room(true);
            page.send('blargh', {message: params.message, room_id: room_id});
        });

        event_bus.on('tom_clancy.change_room_name', function(params) {
            page.send('change_room_name', params);
        });

        event_bus.on('ws.disconnect', function() {
            if (app.disconnected === true) {
                return;
            }

            app.disconnected = true;

            $("<div>Disconnected from server</div>").dialog({
                title: "Oh shit",
                modal: true,
                buttons: {
                    'Ok': function() {
                        $(this).dialog('close');
                    }
                },
                close: function() {
                    app.disconnected = false;
                    window.location = '/';
                    $(this).destroy();
                }
            });
        });

        page.listen('chat', function(data) {
            append_chat(data);
        });

        page.listen('blargh', function(data) {
            var $blargh = $('<div class="blargh prehensile"/>');
            $blargh.append('<div class="header">' + data.username + ' <span class="close">x</span></div>');
            $blargh.append('<div class="body"/>');
            var $body = $blargh.find('.body');
            $body.text(data.message);

            append_custom($blargh, {room_id: data.room_id});
        });

        page.listen('change_room_name', function(data) {
            append_system(data.blame + ' changed the room name to ' + data.new_name, {room_id: data.room_id, class_name: 'wup'});
            app.rename_room_tab(data.room_id, data.new_name);
        });

        page.$("#composer").on('keypress', function(e) {
            if (e.which === 13) {
                var message = $(this).val();

                if (message.length > 0) {
                    var room_id = app.get_active_room(true);
                    page.send('chat', {message: message, room_id: room_id});
                }

                $(this).val('');
            }
        });

        var lobby = options.lobby;
        app.add_room_tab(options.lobby, {focus: true});
        app.ready = true;

        if (lobby.recent_messages.length > 0) {
            var $blargh = $('<div class="blargh"/>');
            $blargh.append('<div class="header">Recent Messages <span class="close">x</span></div>');
            $blargh.append('<div class="body"/>');
            var $body = $blargh.find('.body');

            lobby.recent_messages.forEach(function(mess) {
                $body.append('<div>[' + moment(mess.timestamp).format('hh:mm:ss A') + '] ' + mess.message + '</div>');
            });

            append_custom($blargh, {room_id: lobby.id});
        }
    });

    return {};
};
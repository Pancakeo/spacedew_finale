module.exports = function(...args) {
    const $ = require('jquery');

    let page_name, options, callback;
    if (args.length === 3) {
        page_name = args[0];
        options = args[1];
        callback = args[2];
    }
    else if (args.length == 2) {
        page_name = args[0];
        options = {};
        callback = args[1];
    }

    options = $.extend({popup: false}, options);

    const event_bus = app.event_bus;
    const toolio = require('../app/toolio');
    const ws = require('../app/wupsocket');
    const listeners = [];

    const jQuery = $;

    $.get('html/pages/' + page_name + '.html', function(res) {
        let page = {
            $container: $(res),
            page_name: page_name,
            always_send: {},    // Keys that should go out with every message (e.g. game_id)
            $: function(selector) {
                return jQuery(selector, this.$container);
            },
            listen: function(event_type, listener) {
                let cb = event_bus.on(page_name + '.' + event_type, listener, page.instance_id);
                listeners.push(cb);
            },
            // Use to listen to any event
            peepy: function(full_event_name, listener) {
                let cb = event_bus.on(full_event_name, listener, page.instance_id);
                listeners.push(cb);
            },
            emit: function(event_type, params) {
                event_bus.emit(page_name + '.' + event_type, params);
            },
            send: function(sub_type, data, send_options) {
                send_options = $.extend({
                    page_name: page_name
                }, send_options);

                data = $.extend(data, page.always_send);
                ws.send(send_options.page_name, sub_type, data);
            },
            alert: function(title, message) {
                toolio.alert.apply(this, arguments);
            },
            prompt: function(title, message, existing_value, cb) {
                toolio.prompt.apply(this, arguments);
            },
            get_template: function(template_id) {
                return $templates.filter('[template="' + template_id + '"]').clone().removeAttr('template');
            },
            destroy: function() {
                event_bus.stop_listening(listeners);
            },
            post_message: function(data, target) {
                if (target == null) {
                    target = window.opener;
                }

                if (target && target.closed != true) {
                    target.postMessage(data, app.domain);
                }
            }
        };

        if (options.popup) {
            page.send = function(sub_type, data) {
                data = $.extend(data, page.always_send);

                let ws_message = {
                    listener_name: 'ws.send',
                    type: page.page_name,
                    sub_type: sub_type,
                    message: data
                };

                page.post_message(ws_message);
            };

            page.set_ws_room_id = function() {
                let ws_message = {
                    listener_name: 'ws.set_room_id',
                    room_id: page.room_id,
                    page_name: page_name,
                    instance_id: page.instance_id
                };

                page.post_message(ws_message);
            };

            page.message_handlers = {};

            app.register_window_listener('ws.' + page.page_name, function(message) {
                if (typeof(page.message_handlers[message.sub_type]) == "function") {
                    page.message_handlers[message.sub_type](message.data);
                }
            });

            page.listen = function(event_type, listener) {
                page.message_handlers[event_type] = listener;
            };

        }

        let $templates = page.$('[template]').detach();

        Object.defineProperty(page, 'toolio', {
            get: function() {
                return toolio;
            }
        });

        Object.defineProperty(page, 'ws', {
            get: function() {
                return ws;
            }
        });

        Object.defineProperty(page, 'event_bus', {
            get: function() {
                return event_bus;
            }
        });

        callback(page);
    });
};
module.exports = function(page_name, callback) {
    var event_bus = app.event_bus;
    var toolio = require('../app/toolio');
    var ws = require('../app/wupsocket');

    $.get('html/pages/' + page_name + '.html', function(res) {
        var page = {
            $container: $(res),
            always_send: {},    // Keys that should go out with every message (e.g. game_id)
            $: function(selector) {
                return jQuery(selector, this.$container);
            },
            listen: function(event_type, listener) {
                event_bus.on(page_name + '.' + event_type, listener);
            },
            // Use to listen to any event
            peepy: function(full_event_name, listener) {
                event_bus.on(full_event_name, listener);
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
            }
        };

        var $templates = page.$('[template]').detach();

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
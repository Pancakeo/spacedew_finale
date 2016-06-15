module.exports = function(page_name, callback) {
    var event_bus = require('../../../shared/event_bus');
    var toolio = require('../app/toolio');
    var ws = require('../app/wupsocket');

    $.get('html/pages/' + page_name + '.html', function(res) {
        var page = {
            $container: $(res),
            $: function(selector) {
                return jQuery(selector, this.$container);
            },
            listen: function(event_type, listener) {
                event_bus.on(page_name + '.' + event_type, listener);
            },
            emit: function(event_type, params) {
                event_bus.emit(page_name + '.' + event_type, params);
            },
            send: function(sub_type, data) {
                ws.send(page_name, sub_type, data);
            },
            alert: function(title, message) {
                toolio.alert(title, message);
            },
            prompt: function(title, message, cb) {
                toolio.prompt(title, message, cb);
            }
        };

        callback(page);
    });
};
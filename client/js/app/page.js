module.exports = function(page_name, callback) {
    var event_bus = require('../../../shared/event_bus');
    var toolio = require('../app/toolio');
    var ws = require('../app/wupsocket');

    $.get('html/pages/' + page_name + '.html', function(res) {
        var page = {
            container: $(res),
            $: function(selector) {
                return jQuery(selector, this.container);
            },
            listen: function(event_key, listener) {
                event_bus.on(event_key, listener);
            },
            send: function(type, sub_type, data) {
                ws.send(type, sub_type, data);
            },
            alert: function(title, message) {
                toolio.alert(title, message);
            }
        };

        callback(page);
    });
};
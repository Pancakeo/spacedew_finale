module.exports = function() {

    var ws = require('../app/wupsocket');
    var event_bus = require('../../../shared/event_bus');

    get_page('crabble', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        var crabble_thing = require('../crabble/crabble_helper')(page);

        if (!ws.is_connected()) {
            ws.connect();

            event_bus.on('ws.connect', function() {
                page.send('setup', {});
            });
        }
        else {
            page.send('setup', {});
        }

        page.listen('setup', function(data) {
            console.log(data);
        });

    });

    return {};
};
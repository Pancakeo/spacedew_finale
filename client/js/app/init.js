module.exports = (function() {
    window.app = {
        hidden: (document.hidden === true),
        settings: {}
    };

    var server_settings = {
        server: 'ws://localhost:2001'
    };

    $.extend(app.settings, server_settings);

    document.addEventListener("visibilitychange", function() {
        app.hidden = (document.hidden === true);
    }, false);

    for (var server in server_settings) {
        if (server_settings[server].match('ws://localhost') !== null) {
            server_settings[server] = server_settings[server].replace('localhost', window.location.hostname);
        }
    }

    window.get_page = require('../app/page');
    var wup = require('../pages/login')();
}());
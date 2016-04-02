module.exports = (function() {
    window.spacedew_fin = {};

    var server_settings = {
        server: 'ws://localhost:2001'
    };

    window.spacedew_fin.settings = server_settings;

    for (var server in server_settings) {
        if (server_settings[server].match('ws://localhost') !== null) {
            server_settings[server] = server_settings[server].replace('localhost', window.location.hostname);
        }
    }

    window.get_page = require('../app/page');
    var wup = require('../pages/login')();
}());
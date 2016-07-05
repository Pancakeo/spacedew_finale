module.exports = (function() {
    window.app = {
        settings: {},
        profile: {},
        world: {user_settings: {}} // Users and shit.
    };

    var search = window.location.search;
    var matches = search.split('&');
    var query_params = {};

    matches.forEach(function(match) {
        if (match.indexOf('?') == 0) {
            match = match.slice(1);
        }

        var parts = match.split('=');
        query_params[parts[0]] = parts[1];
    });

    // Dialog stuff.
    $.widget("yehrye.dialog", $.ui.dialog, {
        close: function() {
            var _this = this;
            setTimeout(function() {
                _this.uiDialog.remove();
            }, 0);
            this._superApply(arguments);
        }
    });

    var shared_config = require('../../../shared/shared_config'); // TODO - consider copying shared/* to a more relative folder.

    var server_settings = {
        server: 'ws://localhost:' + shared_config.chat_port
    };

    for (var server in server_settings) {
        if (server_settings[server].match('ws://localhost') !== null) {
            server_settings[server] = server_settings[server].replace('localhost', window.location.hostname);
        }
    }

    $.extend(app.settings, server_settings);
    window.get_page = require('../app/page');

    switch (query_params.wup) {
        case 'emagine':
            require('../pages/emagine')();
            break;

        default:
            require('../pages/login')();
            break;
    }

}());
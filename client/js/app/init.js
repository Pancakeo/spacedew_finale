module.exports = (function() {
    window.app = {
        settings: {},
        profile: {},
        world: {user_settings: {}} // Users and shit.
    };

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

    var server_settings = {
        server: 'ws://localhost:2001'
    };

    for (var server in server_settings) {
        if (server_settings[server].match('ws://localhost') !== null) {
            server_settings[server] = server_settings[server].replace('localhost', window.location.hostname);
        }
    }

    $.extend(app.settings, server_settings);

    window.get_page = require('../app/page');
    var wup = require('../pages/login')();
}());
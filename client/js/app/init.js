module.exports = (function() {
    window.app = {
        hidden: (document.hidden === true),
        settings: {}
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

    document.addEventListener("visibilitychange", function() {
        app.hidden = (document.hidden === true);
    }, false);

    for (var server in server_settings) {
        if (server_settings[server].match('ws://localhost') !== null) {
            server_settings[server] = server_settings[server].replace('localhost', window.location.hostname);
        }
    }

    $.extend(app.settings, server_settings);

    window.get_page = require('../app/page');
    var wup = require('../pages/login')();
}());
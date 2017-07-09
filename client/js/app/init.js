import login from "../pages/login";

(function() {
    require('../../less/_everything.less');
    require('../../node_modules/jquery-ui-bundle/jquery-ui.css')
    
    var $ = require('jquery');
    window.$ = $;
    require('jquery-ui-bundle');
    var toolio = require('../app/toolio');
    require("font-awesome-webpack");

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

    var domain = window.location.protocol + '//' + window.location.hostname;
    if (window.location.port != 80) {
        domain += ":" + window.location.port
    }

    var user_agent = navigator.userAgent.toLowerCase();
    var is_android = user_agent.indexOf("android") > -1;
    var is_iphone = user_agent.indexOf("iphone") > -1;

    window.app = {
        event_bus: require('../../../shared/event_bus'),
        toolio: require('../app/toolio'),
        domain: domain,
        settings: {},
        profile: {},
        emu_list: [],
        window_listeners: {},
        popups: [],
        is_mobile: is_android || is_iphone,
        world: {user_settings: {}} // Users and shit.
    };

    app.register_window_listener = function(listener_name, listener) {
        if (!Array.isArray(app.window_listeners[listener_name])) {
            app.window_listeners[listener_name] = [];
        }

        app.window_listeners[listener_name].push(listener);
    };

    app.ws = require('../app/wupsocket'); // for Lustmord

    // Dialog stuff.
    // $.widget("yehrye.dialog", $.ui.dialog, {
    //     close: function() {
    //         var _this = this;
    //         setTimeout(function() {
    //             _this.uiDialog.remove();
    //         }, 0);
    //         this._superApply(arguments);
    //     }
    // });

    var shared_config = require('../../../shared/shared_config'); // TODO - consider copying shared/* to a more relative folder.

    var protocol = shared_config.use_ssl ? 'wss' : 'ws';
    var server_settings = {
        server: protocol + '://localhost:' + shared_config.chat_port,
        binary_server: protocol + '://localhost:' + shared_config.binary_port
    };

    for (var server in server_settings) {
        if (server_settings[server].match(protocol + '://localhost') !== null) {
            server_settings[server] = server_settings[server].replace('localhost', window.location.hostname);
        }
    }

    $.extend(app.settings, server_settings);
    window.get_page = require('../app/page');

    switch (query_params.wup) {
        case 'black_board':
            require('../pages/black_board')();
            break;

        case 'yownet':
            require('../pages/yownet')();
            break;

        default:
            login();
            // require('../pages/login')();
            break;
    }

    $(window).on('beforeunload', function() {
        app.popups.forEach(function(p) {
            if (p && p.closed != true) {
                p.close();
            }
        });
    });

    window.addEventListener('message', function(e) {
        if (Array.isArray(app.window_listeners[e.data.listener_name])) {
            app.window_listeners[e.data.listener_name].forEach(function(listener) {
                listener(e.data);
            });
        }
    });

})();
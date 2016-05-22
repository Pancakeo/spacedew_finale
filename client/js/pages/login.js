module.exports = function() {
    var event_bus = require('../../../shared/event_bus');
    var ws = require('../app/wupsocket');

    get_page('login', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        page.$('button').prop('disabled', true);
        page.$("#status").text('Connecting...').css({visibility: 'visible'});

        ws.connect();

        event_bus.on('ws.connect', function() {
            page.$("#status").text('Connected!');
            page.$('button').prop('disabled', false);

            if (localStorage.auth_key != null) {
                page.$("#status").text('Logging in (auth_key)...');
                page.$('button').prop('disabled', true);
                page.send('login_with_auth_key', {username: localStorage.username, auth_key: localStorage.auth_key});
            }
        });

        page.listen('login', function(data) {

            if (data.success !== true) {
                if (data.auto_login !== true) {
                    page.alert('Uh oh', "Well that didn't work.");
                    page.$("#status").text('Whoops, try again.');
                }
                else {
                    page.$("#status").text('Auto-login failed.');
                }

                page.$('button').prop('disabled', false);
                return;
            }

            localStorage.auth_key = data.auth_key;
            localStorage.username = data.username;
            require('../pages/tom_clancy')();
        });

        var do_login = function() {
            page.$('button').prop('disabled', true);

            var params = {
                username: page.$('#username').val().trim(),
                password: page.$('#password').val().trim()
            };

            if (params.username.length <= 0 || params.password.length <= 0) {
                page.alert('Missing Ingredients', "Username and password are required.");
                return;
            }

            page.$("#status").text('Logging in...');
            page.send('login', params);
        };

        page.$('#username, #password').on('keypress', function(e) {
            if (page.$('#login').prop('disabled') !== true) {
                if (e.keyCode === 13) {
                    do_login();
                }
            }
        });

        page.$('#login_now').on('click', function() {
            do_login();
        });

        page.$("#sign_up").on('click', function() {
            page.$container.hide();
            require('./create_account')();
        });

        page.$("#username").val(localStorage.username);
    });
};

module.exports = function() {
    var ws = require('../app/wupsocket');

    get_page('login', function(page) {
        var $parent = $('body');
        $parent.append(page.container);

        page.$('button').prop('disabled', true);
        page.$("#status").text('Connecting...').css({visibility: 'visible'});

        ws.connect();

        page.listen('ws.connect', function() {
            page.$("#status").text('Connected!');
            page.$('button').prop('disabled', false);
        });

        page.listen('login.login', function(data) {
            if (data.success !== true) {
                page.alert('Uh oh', "Well that didn't work.");
                page.$('button').prop('disabled', false);
                return;
            }

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
            ws.send('login', 'login', params);
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
            require('./create_account')();
        });

    });
};

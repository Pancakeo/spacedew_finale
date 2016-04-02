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

            var wup = require('../pages/tom_clancy')();
        });

        page.listen('login.create_account', function(data) {
            page.$('button').prop('disabled', false);

            if (data.success !== true) {
                page.alert('Whoops', "Well that didn't work. Reason: " + data.reason);
                return;
            }

            page.alert('Success!', "Account created!");
            page.$("#create_account").hide();
            page.$("#heh_heh").show();
            page.$("#heh_heh input").val('');
        });

        var do_login = function() {
            page.$('button').prop('disabled', true);

            var params = {
                username: page.$('#username').val().trim(),
                password: page.$('#password').val().trim()
            };

            if (params.username.length <= 0 || params.password.length <= 0) {
                toolio.alert('Missing Ingredients', "Username and password are required.");
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

        page.$('#show_create_account').on('click', function() {
            $(this).hide();
            page.$("#heh_heh").hide();
            page.$('#create_account').show();

            setTimeout(function() {
                page.$("#ca_username").focus();
            }, 0);

        });

        page.$('#login_now').on('click', function() {
            do_login();
        });

        page.$("#create_account_now").on('click', function() {
            page.$('button').prop('disabled', true);

            var params = {
                username: page.$('#ca_username').val().trim(),
                password: page.$('#ca_password').val().trim(),
                password_again: page.$('#ca_password_confirm').val().trim()
            };

            if (params.username.length <= 0 || params.password.length <= 0) {
                page.alert('Missing Ingredients', "Username and password are required.");
                return;
            }

            if (params.password !== params.password_again) {
                page.alert("Out of alignment", "Passwords don't match.");
                return;
            }

            delete params.password_again;
            page.$("#status").text('Logging in...');
            ws.send('login', 'create_account', params);
        })
    });
};

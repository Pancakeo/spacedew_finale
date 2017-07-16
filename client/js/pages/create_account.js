import '../../less/create_account.less';

export default function() {
    var event_bus = app.event_bus;
    var ws = require('../app/wupsocket');

    get_page('create_account', function(page) {
        $('body').append(page.$container);

        event_bus.on('login.create_account', function(data) {
            page.$('button').prop('disabled', false);

            if (data.success !== true) {
                page.alert('Whoops', "Well that didn't work. Reason: " + data.reason);
                return;
            }

            page.alert('Success!', "Account created!");
            page.$container.hide();
            $('#login').show();
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
                page.$('button').prop('disabled', false);
                return;
            }

            if (params.password !== params.password_again) {
                page.alert("Out of alignment", "Passwords don't match.");
                page.$('button').prop('disabled', false);
                return;
            }

            delete params.password_again;
            page.$("#status").text('Logging in...');
            ws.send('login', 'create_account', params);
        })
    });
};

import "../../less/login.less";
import * as $ from 'jquery';
import "jquery-ui-bundle";

import tom_clancy from './tom_clancy';
import create_account from './create_account';

export default function () {
    var event_bus = app.event_bus;
    const ws = require('../app/wupsocket');

    get_page('login', function (page) {
        var $parent = $('body');
        $parent.append(page.$container);

        page.$('button').prop('disabled', true);
        page.$("#status").text('Connecting...').css({
            visibility: 'visible'
        });

        ws.connect();

        event_bus.on('ws.connect', function () {
            if (!app.logged_in) {
                page.$("#status").text('Connected!');
                page.$('button').prop('disabled', false);

                if (!document.hidden || localStorage.is_local_dev) {
                    if (localStorage.auth_key != null) {
                        page.$("#status").text('Logging in (auth_key)...');
                        page.$('button').prop('disabled', true);
                        page.send('login_with_auth_key', {
                            username: localStorage.username,
                            auth_key: localStorage.auth_key
                        });
                    }
                }
            }
        });

        event_bus.on('ws.disconnect', function () {
            if (app.disconnected || app.logged_in) {
                return;
            }

            app.disconnected = true;

            $("<div>Disconnected from server</div>").dialog({
                title: "Oh shit",
                modal: true,
                buttons: {
                    'Ok': function () {
                        $(this).dialog('close');
                    }
                },
                close: function () {
                    app.disconnected = false;
                    app.force_logout = true;
                    window.location = '/';
                    $(this).destroy();
                }
            });
        });

        page.listen('login', function (data) {

            if (data.success !== true) {
                if (data.auto_login !== true) {
                    page.alert('Uh oh', "Well that didn't work. Reason: " + data.reason);
                    page.$("#status").text('Whoops, try again.');
                } else {
                    page.$("#status").text('Auto-login failed.');
                }

                page.$('button').prop('disabled', false);
                return;
            }

            if (data.password_change_required) {
                require('./change_password')({
                    banner: "We informations password SHA-1 insecure. Please ship password in provided packaging, and fedes, California.",
                    on_success: function () {
                        page.alert("Password changed", "Password changed. Please refresh and try logging in now.");
                    },
                    on_cancel: function () {
                        window.location = '/';
                    }
                });
                return;
            }

            localStorage.auth_key = data.auth_key;
            localStorage.username = data.username;

            var clancy_stuff = {
                lobby: data.lobby
            };

            app.emu_list = data.emu_list || [];
            app.profile.username = data.username;
            tom_clancy(clancy_stuff);
        });

        var do_login = function () {
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

        page.$('#username, #password').on('keypress', function (e) {
            if (page.$('#login').prop('disabled') !== true) {
                if (e.keyCode === 13) {
                    do_login();
                }
            }
        });

        page.$('#login_now').on('click', function () {
            do_login();
        });

        page.$("#sign_up").on('click', function () {
            page.$container.hide();
            create_account();
        });

        page.$("#username").val(localStorage.username);
    });
};
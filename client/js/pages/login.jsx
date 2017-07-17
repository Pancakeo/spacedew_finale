import "../../less/login.less";
import * as $ from 'jquery';
import "jquery-ui-bundle";

import tom_clancy from './tom_clancy';
import create_account from './create_account';

import React from 'react';

export class LoginComponent extends React.Component {

    constructor(props) {
        super(props);

        let username = '';
        if (localStorage.username) {
            username = localStorage.username;
        }

        this.state = {
            username: username,
            password: '',
            ready: false,
            status: "Connecting..."
        }

        const wupsocket = require('../app/wupsocket');
        this.ws = wupsocket;
        this.ws.connect();

        app.event_bus.on('ws.connect', event => {
            if (!app.logged_in) {
                this.setState({
                    ready: true,
                    status: "Connected!"
                });

                if (!document.hidden || localStorage.is_local_dev) {
                    if (localStorage.auth_key != null) {
                        this.setState({
                            status: 'Logging in (Auth Key)...',
                            ready: false
                        });

                        wupsocket.send('login', 'login_with_auth_key', {
                            username: localStorage.username,
                            auth_key: localStorage.auth_key
                        });
                    }
                }
            }
        });

        app.event_bus.on('ws.disconnect', function () {
            if (app.disconnected || app.logged_in) {
                return;
            }

            app.disconnected = true;

            $("<div>Disconnected from server. Please refresh.</div>").dialog({
                title: "Oh shit",
                modal: true,
                buttons: {
                    'Ok': function () {
                        $(this).dialog('close');
                    }
                },
                close: function () {
                    $(this).destroy();
                }
            });
        });

        app.event_bus.on('login.login', data => {
            if (data.success !== true) {
                let whoops = '';

                if (data.auto_login !== true) {
                    status = 'Whoops, try again.';

                } else {
                    status = 'Auto-login failed!';
                }

                this.setState({
                    ready: true,
                    status: whoops
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

    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;

        this.setState({
            [name]: value
        })
    }

    login() {
        var params = {
            username: this.state.username,
            password: this.state.password
        };

        if (params.username.length <= 0 || params.password.length <= 0) {
            page.alert('Missing Ingredients', "Username and password are required.");
            return;
        }

        this.setState({
            status: "Logging in",
            ready: false
        })

        this.ws.send('login', 'login', params);
    }

    register() {
        this.setState({
            creating_account: true
        });

        create_account();
    }

    render() {
        if (this.state.creating_account) {
            return null;
        }

        return <div id="login">
            <div className="heading">Login</div>
            <div id="status">{this.state.status}</div>

            <div className="field_container">
                <label htmlFor="username">Username</label><input type="text" name="username"
                    autofocus
                    onChange={e => this.handleInputChange(e)} />
            </div>

            <div className="field_container">
                <label htmlFor="password">Password</label><input type="password" name="password"
                    onChange={e => this.handleInputChange(e)} />
            </div>

            <div className="field_container">
                <button id="login_now" onClick={e => this.login()} disabled={!this.state.ready}>Login</button>
                <button id="sign_up" onClick={e => this.register()} disabled={!this.state.ready}>Sign Up!</button>
            </div>
        </div>;
    }
}
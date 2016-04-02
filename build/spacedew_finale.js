(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function() {
    window.spacedew_fin = {};

    var server_settings = {
        server: 'ws://localhost:2001'
    };

    window.spacedew_fin.settings = server_settings;

    for (var server in server_settings) {
        if (server_settings[server].match('ws://localhost') !== null) {
            server_settings[server] = server_settings[server].replace('localhost', window.location.hostname);
        }
    }

    window.get_page = require('../app/page');
    var wup = require('../pages/login')();
}());
},{"../app/page":2,"../pages/login":5}],2:[function(require,module,exports){
module.exports = function(page_name, callback) {
    var event_bus = require('../../../shared/event_bus');
    var toolio = require('../app/toolio');
    var ws = require('../app/wupsocket');

    $.get('html/pages/' + page_name + '.html', function(res) {
        var page = {
            container: $(res),
            $: function(selector) {
                return jQuery(selector, this.container);
            },
            listen: function(event_key, listener) {
                event_bus.on(event_key, listener);
            },
            send: function(type, sub_type, data) {
                ws.send(type, sub_type, data);
            },
            alert: function(title, message) {
                toolio.alert(title, message);
            }
        };

        callback(page);
    });
};
},{"../../../shared/event_bus":7,"../app/toolio":3,"../app/wupsocket":4}],3:[function(require,module,exports){
module.exports = (function() {
    "use strict";
    var toolio = {};

    toolio.alert = function(title, message) {
        w2popup.open({
            title: title,
            body: '<div class="w2ui-centered">' + message + '</div>'
        });
    };

    toolio.generate_id = function() {
        var d = Date.now();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
    };

    toolio.array_to_list = function(arr) {
        if (arr == null) {
            throw "Null array";
        }

        if (arr.length === 0) {
            return "(none)";
        }

        var nice_array = "<ol>";

        for (var i = 0; i < arr.length; i++) {
            nice_array += "<li>" + arr[i] + "</li>";
        }

        nice_array += "</ol>";
        return nice_array;
    };

    /* Fixed arrays are of a constant size and also don't accept duplicates. */
    toolio.push_to_fixed_array = function(arr, value, max_size) {
        if (max_size == null) {
            max_size = 10;
        }

        if (arr == null) {
            throw "Null array";
        }
        if (max_size <= 0) {
            throw "Max size <= 0";
        }

        // don't add again.
        if (arr.indexOf(value) >= 0) {
            return;
        }

        while (arr.length >= max_size) {
            arr.shift();
        }

        arr.push(value);
    };

    toolio.copy_object = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    toolio.string_to_array_buffer = function(str) {
        var buf = new ArrayBuffer(str.length * 2);
        var buf_view = new DataView(buf);

        for (var i = 0; i < str.length; i++) {
            buf_view.setUint16(i * 2, str.charCodeAt(i), true);
        }

        return buf;
    };

    toolio.blob_from_buffer = function(buffer, meta) {
        var header = toolio.string_to_array_buffer(JSON.stringify(meta));

        var header_length = new ArrayBuffer(4);    // 4 bytes = 32-bits.
        new DataView(header_length).setUint32(0, header.byteLength, true); // explicit little endian

        return new Blob([header_length, header, buffer]); // roll it up
    };

    toolio.array_buffer_to_string = function(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    };

    return toolio;
})();


},{}],4:[function(require,module,exports){
module.exports = (function() {
    "use strict";
    var toolio = require('./toolio');
    var event_bus = require('../../../shared/event_bus');

    var wupsocket = {
        reconnect_attempt: 0,
        MAX_RECONNECT_ATTEMPTS: 10
    };

    var connected = false;
    var manually_closed = false;
    var key;

    var death_socket = new Worker('js/public/chat_socket.js');
    death_socket.postMessage({});

    var ws_handlers = {
        connection: function(message) {
            switch (message.sub_type) {
                case 'heartbeat':
                    wupsocket.send('connection', 'heartbeat', message.data);
                    break;
                case 'connection_info':
                    wupsocket.connection_info = message.data;
                    event_bus.emit('ws.connect');
                    break;
                default:
                    break;
            }
        }

    };

    death_socket.addEventListener('message', function(e) {
        var params = e.data.params;

        switch (e.data.action) {
            case 'connect':
                connected = true;
                break;

            case 'disconnect':
                if (manually_closed === false) {
                    event_bus.emit('ws.disconnect');
                }

                connected = false;
                break;

            case 'message':
                var message = params.message;
                // console.log(message);
                if (typeof(ws_handlers[message.type]) == "function") {
                    ws_handlers[message.type](message);
                }
                else {
                    if (message.type != null && message.sub_type != null && message.data != null) {
                        event_bus.emit(message.type + '.' + message.sub_type, message.data);
                    }
                }

                break;

            case 'error':
                event_bus.emit('ws.error');
                break;

            default:
                break;
        }
    });


    wupsocket.send = function(type, sub_type, data) {
        if (connected === false) {
            console.error("Wupsocket is not connected");
            event_bus.emit('ws.error');
            return;
        }

        var wrapped_message = {
            type: type,
            sub_type: sub_type,
            data: data
        };

        death_socket.postMessage({
            action: 'send',
            params: {
                message: wrapped_message
            }
        });
    };

    wupsocket.is_connected = function() {
        return connected;
    };

    wupsocket.close = function() {
        manually_closed = true;
        death_socket.postMessage({action: 'disconnect'});
    };

    wupsocket.connect = function() {
        death_socket.postMessage({action: 'disconnect'});
        wupsocket.reconnect_attempt++;

        death_socket.postMessage({
            action: 'connect',
            params: {
                server_ip: spacedew_fin.settings.server
            }
        });
    };

    return wupsocket;
})();
},{"../../../shared/event_bus":7,"./toolio":3}],5:[function(require,module,exports){
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

},{"../app/wupsocket":4,"../pages/tom_clancy":6}],6:[function(require,module,exports){
module.exports = function() {
    alert('heh');
};
},{}],7:[function(require,module,exports){
var watched_events = {};

exports.on = function(event_name, callback, options) {
    options = Object.assign({fancy: false}, options);

    var callbacks = watched_events[event_name];
    if (callbacks == null) {
        callbacks = [];
        watched_events[event_name] = callbacks;
    }

    callbacks.push({
        emit: callback
    })
};

exports.emit = function(event_name, params) {
    params = Object.assign({}, params);

    var callbacks = watched_events[event_name];

    if (callbacks != null) {
        setTimeout(function() {
            callbacks.forEach(function(cb) {
                cb.emit(params);
            })
        }, 0);
    }
};
},{}]},{},[1]);

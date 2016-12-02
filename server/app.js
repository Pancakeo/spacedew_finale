"use strict";
global.Promise = require("bluebird");

global.app = {};
app.shared_root = require('path').join(__dirname, '..', 'shared');
app.config = require('./conf/configuration').load();

var fs = require('fs');
var storage_thing = require('./managers/storage_thing');

// Verify database exists and prompt user to create. TODO: Warm Prompt.
// TODO - split this section into own source file.

var create_db = false;
var update_db = false;
process.argv.forEach(function(val, index, array) {
    if (val.match(/create_db/i)) {
        create_db = true;
    }

    if (val.match(/update_db/i)) {
        update_db = true;
    }
});

var execute_sql_file = function(sql_file) {
    var contents = fs.readFileSync('./conf/sql/' + sql_file, 'utf8');

    var create_statements = contents.split(";"); // flawless strategy

    for (var i = 0; i < create_statements.length; i++) {
        create_statements[i] = create_statements[i].trim();

        if (create_statements[i].length == 0) {
            create_statements.splice(i, 1);
            i--;
        }
        else {
            create_statements[i] = create_statements[i].trim() + ';';
        }
    }

    var run_statement = function(idx) {
        if (idx >= create_statements.length) {
            console.log("Database probably created/updated. Run the server again to start (without the create_db or update_db arg)");
            return;
        }

        var statement = create_statements[idx];
        storage_thing.run_param_sql(statement, []).then(function() {
            setTimeout(function() {
                run_statement(idx + 1);
            });

        });
    };

    run_statement(0);
};

if (!fs.existsSync(app.config.db_path)) {
    if (create_db) {
        console.log("Creating database...");
        execute_sql_file('db_create.sql')
    }
    else {
        console.log("No database found. Execute with argument 'create_db' to create the database.");
    }

    return;
}

if (update_db) {
    console.log("Updating database...");
    execute_sql_file('db_upgrade.sql');
    return;
}

var WebSocketServer = require('ws').Server;
var chat_port = app.config.chat_port;
var uuid = require('node-uuid');

require('./servers/http_server');
require('./servers/binary_server');
var sessionator = require('./managers/sessionator');

console.log("Listening for WebSocket requests (chat) on port " + chat_port);
var wss = new WebSocketServer({port: chat_port});

var message_router = require('./managers/message_router');

wss.on('connection', function(ws) {
    var connection_id = uuid.v4();
    var session = sessionator.connect(connection_id, ws);

    ws.on('message', function(message) {
        message_router.handle(session, message);
    });

    ws.on('close', function(message) {
        sessionator.disconnect(connection_id);
    });

});

//
// ---
var star_wars = require('./stars/wupfindstar');
setInterval(function() {
    star_wars.update_all();
}, 60000 * 60); // 1 hour.

star_wars.update_all();
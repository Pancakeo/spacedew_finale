"use strict";
global.Promise = require("bluebird");

global.app = {};
app.shared_root = require('path').join(__dirname, '..', 'shared');
app.config = require('./conf/configuration').load();

var fs = require('fs');
var storage_thing = require('./managers/storage_thing');

// Verify database exists and prompt user to create. TODO: Warm Prompt.
// TODO - split this section into own source file.
if (!fs.existsSync(app.config.db_path)) {
    var create_db = false;

    process.argv.forEach(function(val, index, array) {
        if (val.match(/create_db/i)) {
            create_db = true;
        }
    });

    if (create_db) {
        var contents = fs.readFileSync('./conf/db_create.sql', 'utf8');

        console.log("Creating database...");

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
                console.log("Database probably created. Run the server again to start.");
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
    }
    else {
        console.log("No database found. Execute with argument 'create_db' to create the database.");
    }

    return;
}

var WebSocketServer = require('ws').Server;
var chat_port = app.config.chat_port;
var uuid = require('node-uuid');

require('./servers/http_server');
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
"use strict";

const http_port = app.config.http_port;
const express = require('express');
const express_app = express();
const fs = require('fs');

const path = require('path');
const web_root = path.join(__dirname, '../..', 'client/dist');
const compress = require('compression');

express_app.use(express.static(web_root));
express_app.use(compress());

if (app.config.use_ssl) {
    var https = require('https');
    var ssl_cert_folder = app.config.ssl_cert_folder;
    let https_port = app.config.https_port;

    let priv_key_path = path.join(ssl_cert_folder, 'privkey.pem');
    let full_chain_path = path.join(ssl_cert_folder, 'fullchain.pem');

    var options = {
        key: fs.readFileSync(priv_key_path),
        cert: fs.readFileSync(full_chain_path)
    };

    var server = https.createServer(options, express_app);

    let chat_port = app.config.chat_port;
    console.log("Listening for WebSocket requests (chat) on port " + chat_port);
    app.chat_server = https.createServer(options).listen(chat_port);

    let binary_port = app.config.binary_port;
    console.log("Listening for WebSocket requests (binary) on port " + binary_port);
    app.binary_server = https.createServer(options).listen(binary_port);

    server.listen(https_port, function() {
        console.log("Listening for HTTPS (secure) requests on port " + https_port);
    });

    require('http').createServer((req, res) => {
        res.writeHead(301, {location: 'https://www.' + app.config.server_domain});
        res.end();
    }).listen(app.config.http_port);
}
else {
    var http = require('http');
    var server = http.createServer(express_app);

    let chat_port = app.config.chat_port;
    console.log("Listening for WebSocket requests (chat) on port " + chat_port);
    app.chat_server = http.createServer().listen(chat_port);

    let binary_port = app.config.binary_port;
    console.log("Listening for WebSocket requests (binary) on port " + binary_port);
    app.binary_server = http.createServer().listen(binary_port);

    server.listen(http_port, function() {
        console.log("Listening for HTTP requests on port " + http_port);
    });
}

const steamed_nachos = require('../stars/steamed_nachos');

express_app.get('/steam_auth', function(req, res) {
    steamed_nachos.auth(req, res);
});

express_app.get('/steam_verify', function(req, res) {
    steamed_nachos.verify(req, res);
});


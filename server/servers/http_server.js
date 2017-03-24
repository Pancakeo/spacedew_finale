"use strict";

const http_port = app.config.http_port;
const express = require('express');
const express_app = express();
const fs = require('fs');

const path = require('path');
const web_root = path.join(__dirname, '../..', 'build');
const compress = require('compression');

express_app.use(express.static(web_root));
express_app.use(compress());

// if (app.config.use_ssl) {
//     var https = require('https');
//
//     var ssl_path = '/etc/letsencrypt/live/www.yehrye.com/';
//
//     var options = {
//         key: fs.readFileSync(ssl_path + 'privkey.pem'),
//         cert: fs.readFileSync(ssl_path + 'fullchain.pem')
//     };
//
//     var server = https.createServer(options, express_app);
// }
// else {
//     var http = require('http');
//     var server = http.createServer(express_app);
// }

const steamed_nachos = require('../stars/steamed_nachos');

express_app.get('/steam_auth', function(req, res) {
    steamed_nachos.auth(req, res);
});

express_app.get('/steam_verify', function(req, res) {
    steamed_nachos.verify(req, res);
});

var http = require('http');
var server = http.createServer(express_app);

server.listen(http_port, function() {
    console.log("Listening for HTTP requests on port " + http_port);
});

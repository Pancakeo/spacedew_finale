"use strict";
var http = require('http');
var fs = require('fs');
var finalhandler = require('finalhandler');
var serve_static = require('serve-static');

// Root path
var serve_stable = serve_static("../build");
var http_port = app.config.http_port;
var url = require('url');

var steamed_nachos = require('../stars/steamed_nachos');

var server = http.createServer(function(req, res) {
    var parsedUrl = url.parse(req.url, true);

    switch (parsedUrl.pathname) {
        case '/steam_auth':
            steamed_nachos.auth(req, res);
            break;

        case '/steam_verify':
            steamed_nachos.verify(req, res);
            break;

        default:
            var done = finalhandler(req, res);
            serve_stable(req, res, done);
            break;
    }
});

console.log("Listening for HTTP requests on port " + http_port);
server.listen(http_port);
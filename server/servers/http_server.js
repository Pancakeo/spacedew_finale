"use strict";
var http = require('http');
var fs = require('fs');
var finalhandler = require('finalhandler');
var serve_static = require('serve-static');

// Root path
var serve_stable = serve_static("../build");

var server_settings = require('../managers/server_settings');
var http_port = server_settings.get().http_port;

var server = http.createServer(function(req, res) {
    var done = finalhandler(req, res);
    serve_stable(req, res, done);
});

console.log("Listening for HTTP requests on port " + http_port);
server.listen(http_port);
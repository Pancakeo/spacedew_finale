"use strict";

var normalized_path = require("path").join(__dirname, '../observers');

require("fs").readdirSync(normalized_path).forEach(function(file) {
    var observer = require('../observers/' + file);
});
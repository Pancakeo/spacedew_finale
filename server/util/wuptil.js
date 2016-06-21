"use strict";
// Cherry picked from client/../toolio.js

exports.copy_object = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};
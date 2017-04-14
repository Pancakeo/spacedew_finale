"use strict";
// Cherry picked from client/../toolio.js

exports.copy_object = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

const MAX_STRING_LENGTH = 1337;

exports.trim_string = function(str) {
    if (str && str.length > MAX_STRING_LENGTH) {
        str = str.substr(0, MAX_STRING_LENGTH - 1) + ' [...]';
    }

    return str;
};

// Random integer between lower and upper.
exports.random = function(lower, upper, inclusive) {
    var min = lower;
    var max = upper;

    if (inclusive === undefined) {
        inclusive = true;
    }

    if (upper === undefined) {
        var min = 0;
        var max = lower;
    }

    if (inclusive) {
        max += 1;
    }

    var num = Math.floor(Math.random() * (max - min));
    num += min;

    return num;
};

// Choose a thing from an arr-ay.
exports.choose = function(arr) {
    var idx = exports.random(0, arr.length, false);
    return arr[idx];
};

exports.generate_id = function() {
    var d = Date.now();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
};
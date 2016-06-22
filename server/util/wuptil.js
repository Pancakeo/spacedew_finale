"use strict";
// Cherry picked from client/../toolio.js

exports.copy_object = function(obj) {
    return JSON.parse(JSON.stringify(obj));
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
"use strict";

exports.copy_object = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};
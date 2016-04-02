"use strict";
var persistic = require('./persistic');

var settings = {
    http_port: 1991,
    chat_port: 2001
};

var loaded = false;

exports.load = function() {
    return new Promise(function(resolve, reject) {
        persistic.each_param_sql("SELECT key, value FROM server_settings", [])
            .then(function(result) {
                result.rows.forEach(function(row) {
                    settings[row.key] = row.value;
                });

                loaded = true;
                resolve(settings);
            }, function(error) {
                console.log('heh');
                reject(Error('Failed to load server settings from DB'));
            })
    });

};

exports.get = function() {
    if (!loaded) {
        throw 'Attempted to read from settings before load.';
    }
    return settings;
};

exports.set = function(key, value) {
    if (!loaded) {
        throw 'Attempted to write to settings before load.';
    }

    settings[key] = value;

    // Write to db. Note: Doesn't check if the key exists.
    persistic.each_param_sql("UPDATE server_settings SET value = ? WHERE key = ?", [value, key]).then(function() {
        console.log("settings updated.")
    }).catch(function(error) {
        console.log("error updating settings", error);
    })
};
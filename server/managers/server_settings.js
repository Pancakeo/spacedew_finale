"use strict";
var storage_thing = require('./storage_thing');
var Promise = require("bluebird");

var settings = {
    http_port: 1991,
    chat_port: 2001
};

var loaded = false;

exports.load = function() {
    return new Promise(function(resolve, reject) {
        storage_thing.each_param_sql("SELECT key, value FROM server_settings", [])
            .then(function(result) {
                result.rows.forEach(function(row) {
                    settings[row.key] = row.value;
                });

                loaded = true;
                resolve(settings);
            }, function(error) {
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

    storage_thing.each_param_sql('SELECT key FROM server_settings where key = ?', [key]).then(function(result) {
        if (result.rows.length == 0) {
            storage_thing.run_param_sql("INSERT INTO server_settings (key, value) VALUES (?, ?)", [key, value]).then(function(res) {
                console.log("settings updated.")
            });
        }
        else {
            storage_thing.each_param_sql("UPDATE server_settings SET value = ? WHERE key = ?", [value, key]).then(function(result) {
                  console.log("settings updated.")
            })
        }
    });

};
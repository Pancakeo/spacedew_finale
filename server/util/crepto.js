"use strict";
var crypto = require('crypto');
var storage_thing = require('../managers/persistic');

var PBKDF2_ITERATIONS = 10000;
var PBKDF2_KEY_LENGTH = 64;

exports.generate_temporary_password = function(callback) {
    var temp_password = crypto.randomBytes(8).toString('hex');
    exports.hash_password(temp_password, callback, {temporary_password: temp_password});
};

exports.hash_password = function(password) {
    return new Promise(function(resolve, reject) {
        var salt = crypto.randomBytes(16).toString('hex');

        crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, function(error, hashed_password) {
            if (error != null) {
                reject(Error(error));
            }
            else {
                hashed_password = hashed_password.toString('hex');
                resolve({salt: salt, hashed_password: hashed_password});
            }
        });
    });

};

// Query db for salt and then hash with given password. Return undefined if salt is missing or an error occurs.
exports.get_hashed_password = function(username, password) {
    return new Promise(function(resolve, reject) {

        var sql = 'select salty FROM user WHERE username = lower(?)';
        storage_thing.each_param_sql(sql, [username]).then(function(result) {
            if (result.rows.length === 1) {
                var salt = result.rows[0].salty;

                crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, function(error, hashed_password) {
                    if (error == null) {
                        hashed_password = hashed_password.toString('hex');
                        resolve(hashed_password);
                    }
                    else {
                        reject(Error(error));
                    }
                });
            }
            else {
                reject(Error("Not found in DB."));
            }
        });
    });
};

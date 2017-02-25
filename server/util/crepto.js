"use strict";
var crypto = require('crypto');
const PBKDF2_ITERATIONS = 10000;
const PBKDF2_KEY_LENGTH = 64;
const DIGEST = 'sha256';

exports.generate_temporary_password = function(callback) {
    let temp_password = crypto.randomBytes(8).toString('hex');
    exports.hash_password(temp_password, callback, {temporary_password: temp_password});
};

exports.hash_password = function(password) {
    return new Promise(function(resolve, reject) {
        let salt = crypto.randomBytes(16).toString('hex');

        crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, DIGEST, function(error, hashed_password) {
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

exports.get_legacy_hashed_password = function(user, password) {
    return exports.get_hashed_password(user, password, {digest: 'DSA-SHA1'})
};

// Query db for salt and then hash with given password. Return undefined if salt is missing or an error occurs.
exports.get_hashed_password = function(user, password, options) {
    options = Object.assign({digest: DIGEST}, options);

    return new Promise(function(resolve, reject) {
        let salt = user.salty;

        crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, options.digest, function(error, hashed_password) {
            if (error == null) {
                hashed_password = hashed_password.toString('hex');
                resolve({hashed_password: hashed_password});
            }
            else {
                reject(Error(error));
            }
        });
    });
};

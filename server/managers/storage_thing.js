"use strict";
var sqlite3 = require('sqlite3').verbose();
var _ = require('lodash');

/*
 Seems fine for views and updates, but doesn't log some INSERT errors (and may not work at all in that regard).
 */
exports.each_param_sql = function(sql, params) {
    return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(app.config.db_path);

        var result = {rows: []};

        db.each(sql, params, function(err, row) {
            result.rows.push(row);

            if (err != null) {
                console.log(err);
                reject(Error(err));
            }
        }, function(error, rows) {
            if (error != null) {
                console.log(sql, result, error, rows);
                reject(Error(error));
            }

            db.close();
            resolve(result);
        });
    });
};

/*
 Use for insert, and probably update.
 */
exports.run_param_sql = function(sql, params) {
    
    return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(app.config.db_path);

        db.run(sql, params, function(error) {

            if (error != null) {
                db.close();
                reject(Error(error));
            }
            else {
                db.close();
                resolve(null);
            }
        });
    });


};
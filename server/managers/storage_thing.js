"use strict";
var Promise = require("bluebird");
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var db_path = "conf/settings.db";

if (fs.existsSync(db_path) === false) {
    console.log("Database not found, aborting. Db path : " + db_path);
    process.exit(1);
}

/*
 Seems fine for views and updates, but doesn't log some INSERT errors (and may not work at all in that regard).
 */
exports.each_param_sql = function(sql, params) {
    return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(db_path);

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
                reject(Error(err));
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
        var db = new sqlite3.Database(db_path);

        db.run(sql, params, function(error) {
            if (error != null) {
                reject(Error(error));
            }

            resolve(null);
            db.close();
        });
    });


};
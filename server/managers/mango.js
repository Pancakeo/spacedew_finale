var mongo_client = require('mongodb').MongoClient;

// TODO - probably makes sense to have a get() that returns db + collection, to save a level of indentation.
exports.get = function() {
    return new Promise(function(resolve, reject) {
        mongo_client.connect(app.config.mongo_db_url).then(function(db) {
            resolve(db);
        });
    });

};

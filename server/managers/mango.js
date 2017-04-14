var mongo_client = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost:' + app.config.db_port + '/yehrye';

// TODO - probably makes sense to have a get() that returns db + collection, to save a level of indentation.
exports.get = function() {
    return new Promise(function(resolve, reject) {
        mongo_client.connect(MONGO_URL).then(function(db) {
            resolve(db);
        });
    });

};

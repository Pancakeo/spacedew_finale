var mongo_client = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost:' + app.config.db_port + '/yehrye';

exports.get = function() {
    return new Promise(function(resolve, reject) {
        mongo_client.connect(MONGO_URL).then(function(db) {
            resolve(db);
        });
    });

};

// mongo_client.connect(url, function(err, db) {
//     var collection = db.collection('documents');
//
//     // collection.insertMany([
//     //     {a: 1}, {a: 2}, {a: 3}
//     // ], function(err, result) {
//     //     console.log("Inserted 3 documents into the document collection");
//     //     console.log(result);
//     // });
//
//     collection.deleteMany({});
//
//     collection.find({}).toArray(function(err, docs) {
//         console.log(docs);
//     });
//
//     // db.close();
// });
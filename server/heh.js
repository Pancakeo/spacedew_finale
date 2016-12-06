var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://localhost:27017/yehrye';

MongoClient.connect(url, function(err, db) {
    var collection = db.collection('documents');

    // collection.insertMany([
    //     {a: 1}, {a: 2}, {a: 3}
    // ], function(err, result) {
    //     console.log("Inserted 3 documents into the document collection");
    //     console.log(result);
    // });

    collection.deleteMany({});

    collection.find({}).toArray(function(err, docs) {
        console.log(docs);
    });

    // db.close();
});
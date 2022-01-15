const { MongoClient } = require("mongodb");

/* Mongo Connection */
const connStr = process.env.MONGO_DB_ATLAS;
const database = process.env.MONGO_DB_DATABASE;
const client = new MongoClient(connStr, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
    dbContext: function (func) {
        client.connect((error, client) => {
            func(error, client.db(database));
        });
    }
}
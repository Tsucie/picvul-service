const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

// Connection and database
const connStr = process.env.MONGO_DB_ATLAS;
const client = new MongoClient(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
const database = process.env.MONGO_DB_DATABASE;
const collectionName = "follows";

// Example
// client.connect(err => {
//     const collection = client.db(database).collection(collectionName);
// });

/* CRUD Operation */
module.exports = {
    // [GET] ReadList (Partially)

    // [GET] ReadByID (Detail)

    // [POST] Add (Used by userFollow)

    // [PUT/PATCH] Edit

    // [DELETE] Delete Permanently (Used by userUnfollow)
};
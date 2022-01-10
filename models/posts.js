const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

// Connection and database
const connStr = process.env.MONGO_DB_ATLAS;
const client = new MongoClient(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
const database = process.env.MONGO_DB_DATABASE;
const collectionName = "posts";

// Example
// client.connect(err => {
//     const collection = client.db(database).collection(collectionName);
// });

/* CRUD Operation */
module.exports = {
    // [GET] ReadList (Partially, Filtering, and Categorize)

    // [GET] ReadByID (Detail)

    // [POST] Add (Used by userPost)

    // [PUT/PATCH] Edit

    // [DELETE] Delete Permanently
};
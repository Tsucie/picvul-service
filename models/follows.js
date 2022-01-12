const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const random = require("../General/randomNumber");

/* MongoData */
const connStr = process.env.MONGO_DB_ATLAS;
const client = new MongoClient(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
const database = process.env.MONGO_DB_DATABASE;
const collectionName = "follows";

/* CRUD Operation */
module.exports = {
    // [GET] ReadList for user following (Partially)
    ReadListFollowing: function (follower_id_user, page, pageLength, res) {
        try {
            client.connect().then(client => {
                const folsCol = client.db(database).collection(collectionName);
                // pagination
                let skip = (page - 1) * pageLength;
                folsCol.aggregate([
                    {$match: {follower_id_user: follower_id_user}},
                    {$limit: pageLength},
                    {$skip: skip},
                    {$lookup:
                        {
                            from: 'users',
                            localField: 'following_id_user',
                            foreignField: 'id_user',
                            as: 'user'
                        }
                    }
                ]).toArray((error, result) => {
                    if (error) throw error;
                    client.close();
                    if (result == null) {
                        return res.status(404).send({
                            code: 0,
                            message: `Not Found`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `ReadList Successfully`,
                        data: result
                    });
                });
            });
        } catch (error) {
            client.close();
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },

    // [GET] ReadList for user follower (Partially)
    ReadListFollower: function (following_id_user, page, pageLength, res) {
        try {
            client.connect().then(client => {
                const folsCol = client.db(database).collection(collectionName);
                // pagination
                let skip = (page - 1) * pageLength;
                folsCol.aggregate([
                    {$match: {following_id_user: following_id_user}},
                    {$limit: pageLength},
                    {$skip: skip},
                    {$lookup:
                        {
                            from: 'users',
                            localField: 'follower_id_user',
                            foreignField: 'id_user',
                            as: 'user'
                        }
                    }
                ]).toArray((error, result) => {
                    if (error) throw error;
                    client.close();
                    if (result == null) {
                        return res.status(404).send({
                            code: 0,
                            message: `Not Found`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `ReadList Successfully`,
                        data: result
                    });
                });
            });
        } catch (error) {
            client.close();
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },

    // [POST] Add (Used by userFollow)
    AddFollows: function (following_id_user, follower_id_user, res) {
        try {
            if (following_id_user === undefined ||
                following_id_user === "" || 
                follower_id_user === undefined || 
                follower_id_user === "")
                return res.status(400).send({
                    code: 0,
                    message: `following_id_user & follower_id_user cant be empty`
                }); 

            client.connect().then(client => {
                const folsCol = client.db(database).collection(collectionName);
                const doc = {
                    id_follow: random.randomNumber(),
                    following_id_user: Number(following_id_user),
                    follower_id_user: Number(follower_id_user)
                };
                folsCol.insertOne(doc).then(result => {
                    client.close();
                    return res.status(200).send({
                        code: 1,
                        message: "User followed"
                    });
                })
                .catch(error => { throw error });
            });
        } catch (error) {
            client.close();
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },

    // [DELETE] Delete Permanently (Used by userUnfollow)
    DeleteFollows: function (following_id_user, follower_id_user, res) {
        try {
            if (following_id_user === undefined ||
                following_id_user === "" || 
                follower_id_user === undefined || 
                follower_id_user === "")
                return res.status(400).send({
                    code: 0,
                    message: `following_id_user & follower_id_user cant be empty`
                });
            client.connect().then(client => {
                const folsCol = client.db(database).collection(collectionName);
                folsCol.deleteOne({
                    following_id_user: following_id_user,
                    follower_id_user: follower_id_user
                }, (error, result) => {
                    if (error) throw error;
                    client.close();
                    if (result.deletedCount == 0) {
                        return res.status(500).send({
                            code: 0,
                            message: `Delete post failed`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `User unfollowed`
                    });
                });
            });
        } catch (error) {
            client.close();
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    }
};
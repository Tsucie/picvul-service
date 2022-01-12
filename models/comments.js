const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const random = require("../General/randomNumber");

/* MongoData */
const connStr = process.env.MONGO_DB_ATLAS;
const client = new MongoClient(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
const database = process.env.MONGO_DB_DATABASE;
const collectionName = "comments";

/* CRUD Operation */
module.exports = {
    // [GET] ReadList (Partially)
    ReadListComment: function (id_post, page, pageLength, res) {
        try {
            client.connect().then(client => {
                const comsCol = client.db(database).collection(collectionName);
                // Count total comment
                let total_comment = 0;
                comsCol.countDocuments({id_post: id_post}).then((value) => {
                    total_comment = value;
                });
                // pagination
                let skip = (page - 1) * pageLength;
                comsCol.aggregate([
                    {$match: {id_post: id_post}},
                    {$limit: pageLength},
                    {$skip: skip},
                    {$lookup:
                        {
                            from: 'users',
                            localField: 'id_user',
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
                        data: result,
                        total: total_comment
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

    // [GET] ReadByID (Detail)
    ReadByIDComment: function (id_comment, res) {
        try {
            client.connect().then(client => {
                const comsCol = client.db(database).collection(collectionName);
                comsCol.findOne({id_comment: id_comment}, (error, result) => {
                    if (error) throw error;
                    client.close();
                    if (result == null) {
                        return res.status(404).send({
                            code: 0,
                            message: `Comment doesn't exists`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `Comment successfully retrieved`,
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

    // [POST] Add (Used by userPost)
    AddComment: function (id_user, id_post, comment_text, res) {
        try {
            if (id_user === undefined || id_post === undefined || id_user === "" || id_post === "")
                return res.status(400).send({
                    code: 0,
                    message: `Bad request`
                });
            client.connect().then(client => {
                const comsCol = client.db(database).collection(collectionName);
                const doc = {
                    id_comment: random.randomNumber(),
                    id_user: Number(id_user),
                    id_post: Number(id_post),
                    comment_text: comment_text,
                    like_by: [],
                    likes: 0,
                    comment_time: Date.now(),
                    edited_time: 0
                };
                comsCol.insertOne(doc).then(result => {
                    client.close();
                    return res.status(200).send({
                        code: 1,
                        message: "Comment successfully created"
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

    // [PUT/PATCH] Edit
    EditComment: function (id_comment, comment_text, res) {
        try {
            client.connect().then(client => {
                const comsCol = client.db(database).collection(collectionName);
                comsCol.findOne({id_comment: id_comment}, (error, result) => {
                    if (error) throw error;
                    if (result == null) {
                        client.close();
                        return res.status(400).send({
                            code: 0,
                            message: `Bad Request`
                        });
                    }
                    comsCol.updateOne({id_comment: id_comment}, {$set: {
                        comment_text: comment_text
                    }}, (error, result) => {
                        if (error) throw error;
                        client.close();
                        if (result.modifiedCount == 0) {
                            return res.status(500).send({
                                code: 0,
                                message: `Update Comment failed`
                            });
                        }
                        return res.status(200).send({
                            code: 1,
                            message: `Comment has updated`
                        });
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

    // [PUT/PATCH] Plus Like
    EditLikeComment: function (id_comment, like_by, res) {
        try {
            client.connect().then(client => {
                const comsCol = client.db(database).collection(collectionName);
                comsCol.findOne({id_comment: id_comment}, (error, result) => {
                    if (error) throw error;
                    if (result == null) {
                        client.close();
                        return res.status(400).send({
                            code: 0,
                            message: `Bad Request`
                        });
                    }
                    comsCol.updateOne({id_comment: id_comment}, {
                        $push: {like_by: like_by},
                        $set: {likes: result.likes+1}
                    }, (error, result) => {
                        if (error) throw error;
                        client.close();
                        if (result.modifiedCount == 0) {
                            return res.status(500).send({
                                code: 0,
                                message: `Like failed`
                            });
                        }
                        return res.status(200).send({
                            code: 1,
                            message: `Liked`
                        });
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

    // [DELETE] Delete Permanently
    DeleteComment: function (id_comment, res) {
        try {
            client.connect().then(client => {
                const comsCol = client.db(database).collection(collectionName);
                comsCol.deleteOne({id_comment: id_comment}, (error, result) => {
                    if (error) throw error;
                    client.close();
                    if (result.deletedCount == 0) {
                        return res.status(500).send({
                            code: 0,
                            message: `Delete comment failed`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `Comment has deleted`
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
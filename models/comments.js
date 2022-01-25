const dotenv = require("dotenv");
const { ObjectId } = require("mongodb");
const _conn = require("../General/dbContext");
const dateTime = require("../General/dateTime");
dotenv.config();

/* Mongo collection */
const collectionName = "comments";

/* CRUD Operation */
module.exports = {
    // [GET] ReadList (Partially)
    ReadListComment: function (id_post, page, pageLength, res) {
        if (!ObjectId.isValid(id_post) || !page || !pageLength)
            return res.status(400).send({ code: 400, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const comments = db.collection(collectionName);
                // Count total comment
                let total_comment = 0;
                comments.countDocuments({id_post: ObjectId(id_post)}).then((value) => {
                    total_comment = value;
                    // pagination
                    let skip = (page - 1) * pageLength;
                    comments.aggregate([
                        {$match: {id_post: ObjectId(id_post)}},
                        {$limit: pageLength},
                        {$skip: skip},
                        {$lookup:
                            {
                                from: 'users',
                                localField: 'id_user',
                                foreignField: '_id',
                                as: 'user'
                            }
                        }
                    ]).toArray((error, result) => {
                        if (error) throw error;
                        if (result) {
                            for (let i = 0; i < result.length; i++) {
                                // Unset properties
                                delete result[i].user[0]._id;
                                delete result[i].user[0].email;
                                delete result[i].user[0].username;
                                delete result[i].user[0].password;
                                delete result[i].user[0].followings;
                                delete result[i].user[0].followers;
                                delete result[i].user[0].mylikes;
                            }
                            return res.status(200).send({
                                code: 200,
                                message: `ReadList Successfully`,
                                total: total_comment,
                                data: result
                            });
                        }
                        else {
                            return res.status(404).send({ code: 404, message: `Comment Not Found` });
                        }
                    });
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [GET] ReadByID (Detail)
    ReadByIDComment: function (id_comment, res) {
        if (!ObjectId.isValid(id_comment))
            return res.status(400).send({ code: 400, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const comments = db.collection(collectionName);
                comments.findOne({_id: ObjectId(id_comment)}, (error, result) => {
                    if (error) throw error;
                    if (result) {
                        return res.status(200).send({
                            code: 200,
                            message: `Comment successfully retrieved`,
                            data: result
                        });
                    }
                    else {
                        return res.status(404).send({ code: 404, message: `Comment Not Found` });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [POST] Add (Used by userPost)
    AddComment: function (id_user, id_post, comment_text, res) {
        if (!ObjectId.isValid(id_user) || !ObjectId.isValid(id_post) || !comment_text)
            return res.status(400).send({ code: 400, message: `Bad request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const comments = db.collection(collectionName);
                const doc = {
                    id_user: ObjectId(id_user),
                    id_post: ObjectId(id_post),
                    comment_text: comment_text,
                    like_by: [],
                    likes: 0,
                    comment_time: dateTime.Now(),
                    edited_time: "0"
                };
                comments.insertOne(doc).then(result => {
                    return res.status(200).send({ code: 200, message: "Comment successfully created" });
                })
                .catch(error => { throw error });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [PUT/PATCH] Edit
    EditComment: function (id_comment, comment_text, res) {
        if (!ObjectId.isValid(id_comment) || !comment_text)
            return res.status(400).send({ code: 400, message: `Bad request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const comments = db.collection(collectionName);
                comments.findOne({_id: ObjectId(id_comment)}, (error, result) => {
                    if (error) throw error;
                    if (result) {
                        comments.updateOne({_id: ObjectId(id_comment)},
                            {$set: {
                                comment_text: comment_text,
                                edited_time: dateTime.Now()
                            }
                        }, (error, result) => {
                            if (error) throw error;
                            if (result.modifiedCount == 0) {
                                return res.status(500).send({ code: 500, message: `Update Comment failed` });
                            }
                            return res.status(200).send({ code: 200, message: `Comment has updated` });
                        });
                    }
                    else {
                        return res.status(400).send({ code: 400, message: `Bad Request` });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [PUT/PATCH] Plus Like
    EditLikeComment: function (id_comment, like_by, res) {
        if (!ObjectId.isValid(id_comment) || !like_by)
            return res.status(400).send({ code: 400, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const comments = db.collection(collectionName);
                comments.findOne({_id: ObjectId(id_comment)}, (error, result) => {
                    if (error) throw error;
                    if (result) {
                        comments.updateOne({_id: ObjectId(id_comment)}, {
                            $push: {like_by: like_by},
                            $inc: {likes: 1}
                        }, (error, result) => {
                            if (error) throw error;
                            if (result.modifiedCount == 0) {
                                return res.status(500).send({ code: 500, message: `Like failed` });
                            }
                            return res.status(200).send({ code: 200, message: `Liked` });
                        });
                    }
                    else {
                        return res.status(400).send({ code: 400, message: `Bad Request` });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [DELETE] Delete Permanently
    DeleteComment: function (id_comment, res) {
        if (!ObjectId.isValid(id_comment))
            return res.status(400).send({ code: 400, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const comments = db.collection(collectionName);
                comments.deleteOne({_id: ObjectId(id_comment)}, (error, result) => {
                    if (error) throw error;
                    if (result.deletedCount == 0) {
                        return res.status(500).send({ code: 500, message: `Delete comment failed` });
                    }
                    return res.status(200).send({ code: 200, message: `Comment has deleted` });
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    }
};
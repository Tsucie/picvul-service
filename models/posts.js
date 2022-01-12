const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const random = require("../General/randomNumber");

/* MongoData */
const connStr = process.env.MONGO_DB_ATLAS;
const client = new MongoClient(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
const database = process.env.MONGO_DB_DATABASE;
const collectionName = "posts";

/* CRUD Operation */
module.exports = {
    // [GET] ReadList (Partially, Filtering, and Categorize)
    ReadListPost: function (page, pageLength, category, res) {
        try {
            client.connect().then(client => {
                const postCol = client.db(database).collection(collectionName);
                // filtering

                // pagination
                let skip = (page - 1) * pageLength;
                postCol.find({}, {limit: pageLength, skip: skip}).toArray((error, result) => {
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

    // [GET] ReadByID (Detail)
    ReadByIDPost: function (id_post, res) {
        try {
            client.connect().then(client => {
                const postCol = client.db(database).collection(collectionName);
                postCol.findOne({id_post: id_post}, (error, result) => {
                    if (error) throw error;
                    client.close();
                    if (result == null) {
                        return res.status(404).send({
                            code: 0,
                            message: `Post doesn't exists`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `Post successfully retrieved`,
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
    AddPost: function (id_user, categories, title, desc, post_images, res) {
        try {
            client.connect().then(client => {
                const postCol = client.db(database).collection(collectionName);
                // Create the document
                const doc = {
                    id_post: random.randomNumber(0, process.env.INT64_MAX),
                    id_user: id_user,
                    categories: categories,
                    title: title,
                    desc: desc,
                    post_images: post_images,
                    like_by: [],
                    likes: 0,
                    comments: [],
                    comments_count: 0,
                    post_time: Date.now(),
                    edited_time: 0
                };
                postCol.insertOne(doc).then(result => {
                    client.close();
                    return res.status(200).send({
                        code: 1,
                        message: "Post successfully created"
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
    EditPost: function (id_post, categories, title, desc, post_images, res) {
        try {
            client.connect().then(client => {
                const postCol = client.db(database).collection(collectionName);
                postCol.findOne({id_post: id_post}, (error, result) => {
                    if (error) throw error;
                    if (result == null) {
                        client.close();
                        return res.status(400).send({
                            code: 0,
                            message: `Bad Request`
                        });
                    }
                    if (categories === undefined || categories === [] || categories === "")
                        categories = result.categories;
                    if (title === undefined || title === "")
                        title = result.title;
                    if (desc === undefined || desc === "")
                        desc = result.desc;
                    if (post_images === undefined || post_images === [] || post_images === "")
                        post_images = result.post_images;
                    
                    postCol.updateOne({id_post: id_post}, {$set: {
                        categories: categories,
                        title: title,
                        desc: desc,
                        post_images: post_images,
                        edited_time: Date.now()
                    }}, (error, result) => {
                        if (error) throw error;
                        client.close();
                        if (result.modifiedCount == 0) {
                            return res.status(500).send({
                                code: 0,
                                message: `Update Post data failed`
                            });
                        }
                        return res.status(200).send({
                            code: 1,
                            message: `Post data has updated`
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
    DeletePost: function (id_post, res) {
        try {
            client.connect().then(client => {
                const postCol = client.db(database).collection(collectionName);
                postCol.deleteOne({id_post: id_post}, (error, result) => {
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
                        message: `Post has deleted`
                    });
                });
            });
        } catch (error) {
            client.close();
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            })
        }
    }
};
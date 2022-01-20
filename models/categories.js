const dotenv = require("dotenv");
const { ObjectId } = require("mongodb");
const _conn = require("../General/dbContext");
const dateTime = require("../General/dateTime");
dotenv.config();

/* Mongo collection */
const collectionName = "categories";

/* CRUD Operation */
module.exports = {
    // [GET] ReadAll
    ReadAll: function (res) {
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const categories = db.collection(collectionName);
                categories.find({}).toArray((err, result) => {
                    if (err) throw err;
                    if (result) {
                        return res.status(200).send({
                            code: 1,
                            message: `ReadAll Successfully`,
                            data: result
                        });
                    }
                    else {
                        return res.status(404).send({
                            code: 0,
                            message: `Not Found`
                        });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },
    // [GET] ReadByID
    ReadByID: function (id, res) {
        if (!ObjectId.isValid(id))
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const categories = db.collection(collectionName);
                categories.findOne({_id: ObjectId(id)}, (err, result) => {
                    if (err) throw err;
                    if (result) {
                        return res.status(200).send({
                            code: 1,
                            message: `Read Successfully`,
                            data: result
                        });
                    }
                    else {
                        return res.status(404).send({
                            code: 0,
                            message: `Not Found`
                        });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },
    // [POST] AddCategory
    AddCategory: function (name,res) {
        if (!name)
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const categories = db.collection(collectionName);
                categories.insertOne({name: name}, (err, result) => {
                    if (err) throw err;
                    else {
                        return res.status(200).send({
                            code: 1,
                            message: "Category successfully created"
                        });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },
    // [PUT] EditCategoy
    EditCategory: function (id, name, res) {
        if (!ObjectId.isValid(id) || !name)
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const categories = db.collection(collectionName);
                let filter = {_id: ObjectId(id)};
                categories.findOne(filter, (err, data) => {
                    if (err) throw err;
                    if (data) {
                        categories.updateOne(filter, {$set: {name: name}},
                        (ero, result) => {
                            if (ero) throw ero;
                            if (result.modifiedCount == 0) {
                                return res.status(500).send({
                                    code: 0,
                                    message: `Update Category failed`
                                });
                            }
                            else {
                                return res.status(200).send({
                                    code: 1,
                                    message: `Post has updated`
                                });
                            }
                        });
                    }
                    else {
                        return res.status(404).send({
                            code: 0,
                            message: `Not Found`
                        });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },
    // [Delete] DeleteCategory
    DeleteCategory: function (id, res) {
        if (!ObjectId.isValid(id))
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const categories = db.collection(collectionName);
                categories.deleteOne({_id: ObjectId(id)}, (error, result) => {
                    if (error) throw error;
                    if (result.deletedCount == 0) {
                        return res.status(500).send({
                            code: 0,
                            message: `Delete category failed`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `Category has deleted`
                    });
                });
            });
        } catch (error) {
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    }
}
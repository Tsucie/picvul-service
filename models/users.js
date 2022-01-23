const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { ObjectId } = require("mongodb");
const _conn = require("../General/dbContext");
const random = require("../General/randomNumber");
const dateTime = require("../General/dateTime");
dotenv.config();
const saltRounds = 10;

/* Mongo collection */
const collectionName = "users";

/* CRUD Operation */
module.exports = {
    // [POST] Authentication Check
    Authentication: function (email, password, func) {
        if (!email || !password)
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            var validation = { result: false, error: '', user: '' };
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const users = db.collection(collectionName);
                users.findOne({email: email}, (error, user) => {
                    if (error) throw error;
                    if (user) {
                        bcrypt.compare(password, user.password, (err, same) => {
                            if (err) throw err;
                            if (same) {
                                // unset password
                                delete user.password;
                                validation.result = true;
                                validation.user = user;
                                func(validation);
                            }
                            else func(validation);
                        });
                    }
                    else func(validation);
                });
            });
        } catch (error) {
            validation.error = error;
            func(validation);
        }
    },

    // [GET] ReadList (Searching) ~ Need more refision (filter)
    ReadListUser: function (filterByJob, page, pageLength, res) {
        if (!page || !pageLength)
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const users = db.collection(collectionName);
                // filtering
                let filter = {};
                if (filterByJob) filter = {job: filterByJob};
                //pagination
                let skip = (page - 1) * pageLength;
                users.aggregate([
                    {$match: filter},
                    {$sort: {fullname: 1}},
                    {$limit: pageLength},
                    {$skip: skip}
                ]).toArray((error, result) => {
                    if (error) throw error;
                    if (result) {
                        for (let i = 0; i < result.length; i++) {
                            // unset properties
                            delete result[i].password;
                            delete result[i].mylikes;
                        }
                        return res.status(200).send({
                            code: 1,
                            message: `ReadList Successfully`,
                            page: page,
                            length: pageLength,
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

    ReadUserUpdates: function (page, pageLength, res) {
        if (!page || !pageLength)
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const users = db.collection(collectionName);
                //pagination
                let skip = (page - 1) * pageLength;
                users.aggregate([
                    {$lookup:
                        {
                            from: 'posts',
                            localField: '_id',
                            foreignField: 'id_user',
                            as: 'post'
                        }
                    },
                    {$match: {"post": {$ne: []}}},
                    {$limit: pageLength},
                    {$skip: skip}
                ]).toArray((error, result) => {
                    if (error) throw error;
                    if (result) {
                        let data = [];
                        for (let i = 0; i < result.length; i++) {
                            let ele = {
                                id: result[i]._id,
                                username: result[i].username,
                                fullname: result[i].fullname,
                                post_images: []
                            };
                            for (let j = 0; j < 3; j++) {
                                ele.post_images.push(result[i].post[j].post_images[0]);
                            }
                            data.push(ele);
                        }
                        return res.status(200).send({
                            code: 1,
                            message: `ReadList Successfully`,
                            page: page,
                            length: pageLength,
                            updates: data
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

    // [GET] ReadByID (Detail)
    ReadByIDUser: function (id_user, res) {
        if (!ObjectId.isValid(id_user))
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const users = db.collection(collectionName);
                users.findOne({_id: ObjectId(id_user)}, (error, result) => {
                    if (error) throw error;
                    if (result) {
                        // Unset property
                        delete result.password;
                        return res.status(200).send({
                            code: 1,
                            message: `Data successfully retrieved`,
                            data: result
                        });
                    }
                    else {
                        return res.status(404).send({
                            code: 0,
                            message: `User doesn't exists`
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

    // [POST] Add (Used by userRegist)
    AddUser: function (email, username, fullname, password, job, profile_image, res) {
        if (!email || !username || !fullname || !password || !job || !profile_image)
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                // email validation
                const users = db.collection(collectionName);
                users.countDocuments({email: email}, (error, value) => {
                    if (error) throw error;
                    if (value > 0) {
                        return res.status(200).send({
                            code: 406,
                            message: `${email} is already exists, try login with your registered email`
                        });
                    }
                    else {
                        // username validation
                        users.countDocuments({username: username}, (err, val) => {
                            if (err) throw err;
                            if (val > 0) {
                                return res.status(406).send({
                                    code: 0,
                                    message: `${username} has taken, try ${username + random.randomNumber(1000, 9999)}`
                                });
                            }
                            else {
                                // Create the document
                                const doc = {
                                    email: email,
                                    username: username,
                                    fullname: fullname,
                                    password: bcrypt.hashSync(password, saltRounds),
                                    job: job,
                                    profile_image: profile_image,
                                    followings: 0,
                                    followers: 0,
                                    mylikes: [],
                                    status: true,
                                    deleted: ""
                                };
                                users.insertOne(doc, (ero, result) => {
                                    if (ero) throw ero;
                                    if (result.insertedId) {
                                        return res.status(200).send({
                                            code: 1,
                                            message: "Account successfully created",
                                            id_user: result.insertedId
                                        });
                                    }
                                });
                            }
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

    // [PUT/PATCH] Edit
    EditUser: function (id_user, email, username, fullname, job, profile_image, res) {
        if (!ObjectId.isValid(id_user))
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const users = db.collection(collectionName);
                users.findOne({_id: ObjectId(id_user)}, (error, result) => {
                    if (error) throw error;
                    if (result == null || result.length == 0) {
                        return res.status(400).send({
                            code: 0,
                            message: `Bad Request`
                        });
                    }
                    if (!email) email = result.email;
                    if (!username) username = result.username;
                    if (!fullname) fullname = result.fullname;
                    if (!job) job = result.job;
                    if (!profile_image) profile_image = result.profile_image;
                    
                    let doc = {
                        email: email,
                        username: username,
                        fullname: fullname,
                        job: job,
                        profile_image: profile_image
                    };
                    users.updateOne({_id: ObjectId(id_user)}, {$set: doc}, (error, result) => {
                        if (error) throw error;
                        if (result.modifiedCount == 0) {
                            return res.status(500).send({
                                code: 0,
                                message: `Update account data failed`
                            });
                        }
                        return res.status(200).send({
                            code: 1,
                            message: `Account data has updated`
                        });
                    });
                });
            });
        } catch (error) {
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },

    // [PUT/PATCH] EditPassword
    EditPassword: function (id_user, oldPassword, newPassword, res) {
        if (!ObjectId.isValid(id_user))
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const users = db.collection(collectionName);
                users.findOne({_id: ObjectId(id_user)}, (error, result) => {
                    if (error) throw error;
                    if (result == null || result.length == 0) {
                        return res.status(400).send({
                            code: 0,
                            message: `Bad Request`
                        });
                    }
                    bcrypt.compare(oldPassword, result.password, (err, same) => {
                        if (err) throw err;
                        if (same == false) {
                            return res.status(406).send({
                                code: 0,
                                message: `Old password doesn't match with user password`
                            });
                        }
                        bcrypt.hash(newPassword, saltRounds, (ero, encrypted) => {
                            if (ero) throw ero;
                            users.updateOne({_id: ObjectId(id_user)}, {$set: {password: encrypted}}, (errs, result) => {
                                if (errs) throw errs;
                                if (result.modifiedCount == 0) {
                                    return res.status(500).send({
                                        code: 0,
                                        message: `Update password failed`
                                    });
                                }
                                return res.status(200).send({
                                    code: 1,
                                    message: `Password has updated`
                                });
                            });
                        });
                    });
                });
            });
        } catch (error) {
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },

    // [DELETE] Delete Permanently
    DeleteUser: function (id_user, res) {
        if (!ObjectId.isValid(id_user))
            return res.status(400).send({ code: 0, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const users = db.collection(collectionName);
                users.updateOne(
                    {_id: ObjectId(id_user)}, 
                    {$set:
                        {
                            status: false,
                            deleted: dateTime.Now()
                        }
                    },
                    (error, result) => {
                    if (error) throw error;
                    if (result.modifiedCount == 0) {
                        return res.status(500).send({
                            code: 0,
                            message: `Delete account failed`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `Account has deleted`
                    });
                });
            });
        } catch (error) {
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },
};
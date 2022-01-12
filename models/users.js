const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const random = require("../General/randomNumber");
const saltRounds = 10;

/* MongoData */
const connStr = process.env.MONGO_DB_ATLAS;
const client = new MongoClient(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
const database = process.env.MONGO_DB_DATABASE;
const collectionName = "users";

/* CRUD Operation */
module.exports = {
    // [POST] Authentication Check
    Authentication: function (email, password, res) {
        try {
            client.connect().then(client => {
                const userCol = client.db(database).collection(collectionName);
                userCol.findOne({email: email}, (error, result) => {
                    if (error) throw error;
                    if (result == null) {
                        client.close();
                        return res.status(404).send({
                            code: 0,
                            message: `${email} doesn't exists, try signUp with your valid email`
                        });
                    }
                    bcrypt.compare(password, result.password, (err, same) =>{
                        if (err) throw err;
                        if (same == true) {
                            client.close();
                            return res.status(200).send({
                                code: 1,
                                message: "Authentication success"
                            });
                        }
                        if (same == false) {
                            client.close();
                            return res.status(406).send({
                                code: 0,
                                message: "Your password is wrong"
                            });
                        }
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

    // [GET] ReadList (Searching) ~ Need more refision (ops filtering, pagination)
    ReadListUser: function (filterByFullName, filterByJob, page, pageLength, res) {
        try {
            client.connect().then(client => {
                const userCol = client.db(database).collection(collectionName);
                // filtering
                // let fullname, job;
                // if (filterByFullName !== undefined || filterByFullName !== "")
                //     fullname = filterByFullName;
                // if (filterByJob !== undefined || filterByJob !== "")
                //     job = filterByJob;
                
                //pagination
                let skip = (page - 1) * pageLength;
                userCol.find({}, {limit: pageLength, skip: skip}).toArray((error, result) => {
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
    ReadByIDUser: function (id_user, res) {
        try {
            client.connect().then(client => {
                const userCol = client.db(database).collection(collectionName);
                userCol.findOne({id_user: id_user}, (error, result) => {
                    if (error) throw error;
                    client.close();
                    if (result == null) {
                        return res.status(404).send({
                            code: 0,
                            message: `User doesn't exists`
                        });
                    }
                    return res.status(200).send({
                        code: 1,
                        message: `Data successfully retrieved`,
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

    // [POST] Add (Used by userRegist)
    AddUser: function (email, username, fullname, password, job, profile_image, res) {
        try {
            client.connect().then(client => {
                const userCol = client.db(database).collection(collectionName);
                // email validation
                if (userCol.find({email: email}).count > 0) {
                    client.close();
                    return res.status(406).send({
                        code: 0,
                        message: `${email} is already exists, try login with your registered email`
                    });
                }
                // username validation
                if (userCol.find({username: username}).count > 0) {
                    client.close();
                    return res.status(406).send({
                        code: 0,
                        message: `${username} has taken, try ${username + random.randomNumber(1000, 9999)}`
                    });
                }
                // Create the document
                const doc = {
                    id_user: random.randomNumber(0, process.env.INT64_MAX),
                    email: email,
                    username: username,
                    fullname: fullname,
                    password: bcrypt.hashSync(password, saltRounds),
                    job: job,
                    profile_image: profile_image,
                    followings: 0,
                    followers: 0
                };
                userCol.insertOne(doc).then(result => {
                    client.close();
                    return res.status(200).send({
                        code: 1,
                        message: "Account successfully created"
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
    EditUser: function (id_user, email, username, fullname, job, profile_image, res) {
        try {
            client.connect().then(client => {
                const userCol = client.db(database).collection(collectionName);
                userCol.findOne({id_user: id_user}, (error, result) => {
                    if (error) throw error;
                    if (result == null) {
                        client.close();
                        return res.status(400).send({
                            code: 0,
                            message: `Bad Request`
                        });
                    }
                    if (email === undefined || email === "")
                        email = result.email;
                    if (username === undefined || username === "")
                        username = result.username;
                    if (fullname === undefined || fullname === "")
                        fullname = result.fullname;
                    if (job === undefined || job === "")
                        job = result.job;
                    if (profile_image === undefined || profile_image === "")
                        profile_image = result.profile_image;
                    
                    userCol.updateOne({id_user: id_user}, {$set: {
                        email: email,
                        username: username,
                        fullname: fullname,
                        job: job,
                        profile_image: profile_image
                    }}, (error, result) => {
                        if (error) throw error;
                        client.close();
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
            client.close();
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },

    // [PUT/PATCH] EditPassword
    EditPassword: function (id_user, oldPassword, newPassword, res) {
        try {
            client.connect().then(client => {
                const userCol = client.db(database).collection(collectionName);
                userCol.findOne({id_user: id_user}, (error, result) => {
                    if (error) throw error;
                    if (result == null) {
                        client.close();
                        return res.status(400).send({
                            code: 0,
                            message: `Bad Request`
                        });
                    }
                    bcrypt.compare(oldPassword, result.password, (err, same) => {
                        if (err) throw err;
                        if (same == false) {
                            client.close();
                            return res.status(406).send({
                                code: 0,
                                message: `Old password doesn't match with user password`
                            });
                        }
                        bcrypt.hash(newPassword, saltRounds, (err, encrypted) => {
                            if (err) throw err;
                            userCol.updateOne({id_user: id_user}, {$set: {password: encrypted}})
                            .then(result => {
                                client.close();
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
            client.close();
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },

    // [DELETE] Delete Permanently
    DeleteUser: function (id_user, res) {
        try {
            client.connect().then(client => {
                const userCol = client.db(database).collection(collectionName);
                userCol.deleteOne({id_user: id_user}, (error, result) => {
                    if (error) throw error;
                    client.close();
                    if (result.deletedCount == 0) {
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
            client.close();
            return res.status(500).send({
                code: -1,
                message: `Internal Server Error: ${error}`
            });
        }
    },
};
const dotenv = require("dotenv");
const { ObjectId } = require("mongodb");
const _conn = require("../General/dbContext");
dotenv.config();

/* MongoData */
const collectionName = "follows";

function readList(readContext, id_user, page, pageLength, func) {
    _conn.dbContext((error, db) => {
        if (error) throw error;
        const follows = db.collection(collectionName);
        // pagination & filter condition
        let skip = (page - 1) * pageLength;
        let match = (readContext == "following") ? 
            {follower_id_user: ObjectId(id_user)} : {following_id_user: ObjectId(id_user)};
        let localField = (readContext == "following") ? 'following_id_user':'follower_id_user';
        follows.aggregate([
            {$match: match},
            {$limit: pageLength},
            {$skip: skip},
            {$lookup:
                {
                    from: 'users',
                    localField: localField,
                    foreignField: '_id',
                    as: 'user'
                }
            }
        ]).toArray((error, result) => {
            let data = [];
            for (let i = 0; i < result.length; i++) {
                // unset properties
                delete result[i].user[0].password;
                delete result[i].user[0].followings;
                delete result[i].user[0].followers;
                delete result[i].user[0].mylikes;
                data.push(result[i].user[0]);
            }
            func(error, data);
        });
    });
}

function readAll(collection, readContext, id_user, func) {
    let match = (readContext == "following") ? 
        {follower_id_user: ObjectId(id_user)} : {following_id_user: ObjectId(id_user)};
    let localField = (readContext == "following") ? 'following_id_user':'follower_id_user';
    collection.aggregate([
        {$match: match},
        {$lookup:
            {
                from: 'users',
                localField: localField,
                foreignField: '_id',
                as: 'user'
            }
        }
    ]).toArray((error, result) => {
        let data = [];
        for (let i = 0; i < result.length; i++) {
            // unset properties
            delete result[i].user[0].password;
            delete result[i].user[0].followings;
            delete result[i].user[0].followers;
            delete result[i].user[0].mylikes;
            data.push(result[i].user[0]);
        }
        func(error, data);
    });
}

/* CRUD Operation */
module.exports = {
    // [GET] ReadList for user following (Partially)
    ReadListFollowing: function (follower_id_user, page, pageLength, res) {
        if (!ObjectId.isValid(follower_id_user) || !page || !pageLength)
            return res.status(400).send({ code: 400, message: `Bad Request` });
        try {
            readList("following", follower_id_user, page, pageLength, (error, result) => {
                if (error) throw error;
                if (result == null || result.length == 0) {
                    return res.send({ code: 404, message: `Not Found` });
                }
                return res.send({
                    code: 200,
                    message: `Read following list Successfully`,
                    data: result
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [GET] ReadList for user follower (Partially)
    ReadListFollower: function (following_id_user, page, pageLength, res) {
        if (!ObjectId.isValid(following_id_user) || !page || !pageLength)
            return res.status(400).send({ code: 400, message: `Bad Request` });
        try {
            readList("follower", following_id_user, page, pageLength, (error, result) => {
                if (error) throw error;
                if (result == null || result.length == 0) {
                    return res.status(404).send({ code: 404, message: `Not Found` });
                }
                return res.status(200).send({
                    code: 200,
                    message: `Read follower list Successfully`,
                    data: result
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [GET] ReadAll by specific user follows
    ReadAllUserFollows: function (id_user, func) {
        try {
            var resmsg = { code: 0, message: '', data: { followings: [], followers: [] }};
            if (!ObjectId.isValid(id_user)) {
                resmsg.code = 400;
                resmsg.message = `Bad Request`;
                resmsg.data = null;
                func(resmsg);
            }
            else {
                _conn.dbContext((error, db) => {
                    if (error) throw error;
                    const follows = db.collection(collectionName);
                    // read followings
                    readAll(follows, "following", id_user, (error, result) => {
                        if (error) throw error;
                        if (result) resmsg.data.followings = result;
                        // read follower
                        readAll(follows, "follower", id_user, (error, result) => {
                            if (error) throw error;
                            if (result) resmsg.data.followers = result;
                            resmsg.code = 200;
                            resmsg.message = "Get follows successfully";
                            func(resmsg);
                        });
                    });
                });
            }
        } catch (error) {
            resmsg.code = 500;
            resmsg.message = `Internal server Error: ${error}`;
            resmsg.data = null;
            func(resmsg);
        }
    },

    // [POST] Add (Used by userFollow)
    AddFollows: function (following, follower, res) {
        if (!following || !follower)
            return res.status(400).send({ code: 400, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const follows = db.collection(collectionName);
                const users = db.collection("users");
                users.findOne({username: following}, (err, user1) => {
                    if (err) throw err;
                    if (user1 == null) {
                        return res.status(404).send({ code: 404, message: "User 1 not found" });
                    }
                    else {
                        users.findOne({username: follower}, (err, user2) => {
                            if (err) throw err;
                            if (user2 == null) {
                                return res.status(404).send({ code: 404, message: "User 2 not found" });
                            }
                            else {
                                const doc = {
                                    following_id_user: user1._id,
                                    follower_id_user: user2._id
                                };
                                follows.findOne(doc, (err, check) => {
                                    if (err) throw err;
                                    if (check != null) {
                                        return res.status(205).send({ code: 205, message: "Already followed" });
                                    }
                                    else {
                                        follows.insertOne(doc).then(() => {
                                            const users = db.collection("users");
                                            users.updateOne({_id: user1._id}, {$inc: {followers: 1}}, (err) => {
                                                if (err) throw err;
                                                users.updateOne({_id: user2._id}, {$inc: {followings: 1}}, (err) => {
                                                    if (err) throw err;
                                                    return res.status(200).send({ code: 200, message: "User followed" });
                                                });
                                            });
                                        })
                                        .catch(error => { throw error });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [DELETE] Delete Permanently (Used by userUnfollow)
    DeleteFollows: function (following, follower, res) {
        if (!following || !follower)
            return res.status(400).send({ code: 400, message: `Bad Request` });
        try {
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const follows = db.collection(collectionName);
                const users = db.collection("users");
                users.findOne({username: following}, (err, user1) => {
                    if (err) throw err;
                    if (user1 == null) {
                        return res.status(404).send({ code: 404, message: "User 1 not found" });
                    }
                    else {
                        users.findOne({username: follower}, (err, user2) => {
                            if (err) throw err;
                            if (user2 == null) {
                                return res.status(404).send({ code: 404, message: "User 2 not found" });
                            }
                            else {
                                follows.deleteOne({
                                    following_id_user: user1._id,
                                    follower_id_user: user2._id
                                },
                                (error, result) => {
                                    if (error) throw error;
                                    if (result.deletedCount == 0) {
                                        return res.status(205).send({ code: 205, message: `Already unfollowed` });
                                    }
                                    else {
                                        const users = db.collection("users");
                                        users.updateOne({_id: user1._id}, {$inc: {followers: -1}}, (err) => {
                                            if (err) throw err;
                                            users.updateOne({_id: user2._id}, {$inc: {followings: -1}}, (err) => {
                                                if (err) throw err;
                                                return res.status(200).send({ code: 200, message: `User unfollowed` });
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    }
};
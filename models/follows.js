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
            func(error, result);
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
            return res.send({ code: 400, message: `Bad Request` });
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
            return res.send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [GET] ReadList for user follower (Partially)
    ReadListFollower: function (following_id_user, page, pageLength, res) {
        if (!ObjectId.isValid(following_id_user) || !page || !pageLength)
            return res.send({ code: 400, message: `Bad Request` });
        try {
            readList("follower", following_id_user, page, pageLength, (error, result) => {
                if (error) throw error;
                if (result == null || result.length == 0) {
                    return res.send({ code: 404, message: `Not Found` });
                }
                return res.send({
                    code: 200,
                    message: `Read follower list Successfully`,
                    data: result
                });
            });
        } catch (error) {
            return res.send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [GET] ReadAll by specific user follows
    ReadAllUserFollows: function (id_user, func) {
        try {
            var resmsg = { code: 0, message: '', data: { followings: [], followers: [] }};
            if (!ObjectId.isValid(id_user)) {
                resmsg.code = 0;
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
                            resmsg.code = 1;
                            resmsg.message = "Get follows successfully";
                            func(resmsg);
                        });
                    });
                });
            }
        } catch (error) {
            resmsg.code = -1;
            resmsg.message = `Internal server Error: ${error}`;
            resmsg.data = null;
            func(resmsg);
        }
    },

    // [POST] Add (Used by userFollow)
    AddFollows: function (following_id_user, follower_id_user, res) {
        if (!ObjectId.isValid(following_id_user) || !ObjectId.isValid(follower_id_user))
            return res.send({ code: 400, message: `Bad Request` });
        try {
            let objIdFollowing = ObjectId(following_id_user);
            let objIdFollower = ObjectId(follower_id_user);
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const follows = db.collection(collectionName);
                const doc = {
                    following_id_user: objIdFollowing,
                    follower_id_user: objIdFollower
                };
                follows.insertOne(doc).then(() => {
                    const users = db.collection("users");
                    users.updateOne({_id: objIdFollowing}, {$inc: {followers: 1}}, (err) => {
                        if (err) throw err;
                        users.updateOne({_id: objIdFollower}, {$inc: {followings: 1}}, (err) => {
                            if (err) throw err;
                            return res.send({ code: 200, message: "User followed" });
                        });
                    });
                })
                .catch(error => { throw error });
            });
        } catch (error) {
            return res.send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },

    // [DELETE] Delete Permanently (Used by userUnfollow)
    DeleteFollows: function (following_id_user, follower_id_user, res) {
        if (!ObjectId.isValid(following_id_user) || !ObjectId.isValid(follower_id_user))
            return res.send({ code: 400, message: `Bad Request` });
        try {
            let objIdFollowing = ObjectId(following_id_user);
            let objIdFollower = ObjectId(follower_id_user);
            _conn.dbContext((error, db) => {
                if (error) throw error;
                const follows = db.collection(collectionName);
                follows.deleteOne({
                    following_id_user: objIdFollowing,
                    follower_id_user: objIdFollower
                },
                (error, result) => {
                    if (error) throw error;
                    if (result.deletedCount == 0) {
                        return res.send({ code: 500, message: `Unfollow failed` });
                    }
                    const users = db.collection("users");
                    users.updateOne({_id: objIdFollowing}, {$inc: {followers: -1}}, (err) => {
                        if (err) throw err;
                        users.updateOne({_id: objIdFollower}, {$inc: {followings: -1}}, (err) => {
                            if (err) throw err;
                            return res.send({ code: 200, message: `User unfollowed` });
                        });
                    });
                });
            });
        } catch (error) {
            return res.send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    }
};
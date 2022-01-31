const follows = require("../models/follows");

module.exports = {
    GetListFollowing: function (req, res) {
        const { follower_id_user, page, pageLength } = req.body;
        follows.ReadListFollowing(follower_id_user, page, pageLength, res);
    },
    GetListFollower: function (req, res) {
        const { following_id_user, page, pageLength } = req.body;
        follows.ReadListFollower(following_id_user, page, pageLength, res);
    },
    GetAllFollows: function (req, res) {
        const { id_user } = req.params;
        follows.ReadAllUserFollows(id_user, (resmsg) => {
            return res.status(resmsg.code).send(resmsg);
        });
    },
    UserFollow: function (req, res) {
        const { following, follower } = req.body;
        follows.AddFollows(following, follower, res);
    },
    UserUnfollow: function (req, res) {
        const { following, follower } = req.body;
        follows.DeleteFollows(following, follower, res);
    }
}
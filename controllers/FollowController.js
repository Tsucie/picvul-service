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
    UserFollow: function (req, res) {
        const { following_id_user, follower_id_user } = req.body;
        follows.AddFollows(following_id_user, follower_id_user, res);
    },
    UserUnfollow: function (req, res) {
        const { following_id_user, follower_id_user } = req.body;
        follows.DeleteFollows(following_id_user, follower_id_user, res);
    }
}
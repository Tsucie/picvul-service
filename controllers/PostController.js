const posts = require("../models/posts");

module.exports = {
    PostGetList: function (req, res) {
        console.log(req.body);
        const { page, pageLength, filterByCategory, sortBy } = req.body;
        posts.ReadListPost(page, pageLength, filterByCategory, sortBy, res);
    },
    PostGetByID: function (req, res) {
        const { id_post } = req.params;
        posts.ReadByIDPost(id_post, res);
    },
    PostCreate: function (req, res) {
        const { id_user, categories, title, desc, post_images } = req.body;
        posts.AddPost(id_user, categories, title, desc, post_images, res);
    },
    PostEdit: function (req, res) {
        const { id_post, categories, title, desc, post_images } = req.body;
        posts.EditPost(id_post, categories, title, desc, post_images, res);
    },
    PostLike: function (req, res) {
        const { id_post, like_by } = req.body;
        posts.EditLikePost(id_post, like_by, res);
    },
    PostDelete: function (req, res) {
        const { id_post } = req.params;
        posts.DeletePost(id_post, res);
    }
}
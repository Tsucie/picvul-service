const posts = require("../models/posts");

module.exports = {
    PostGetList: function (req, res) {
        const { page, pageLength, category } = req.body;
        posts.ReadListPost(page, pageLength, category, res);
    },
    PostGetByID: function (req, res) {
        const { id_post } = req.body;
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
    PostDelete: function (req, res) {
        const { id_post } = req.body;
        posts.DeletePost(id_post, res);
    }
}
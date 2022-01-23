const comments = require("../models/comments");

module.exports = {
    CommentGetList: function (req, res) {
        const { id_post, page, pageLength } = req.body;
        comments.ReadListComment(id_post, page, pageLength, res);
    },
    CommentGetByID: function (req, res) {
        const { id_comment } = req.params;
        comments.ReadByIDComment(id_comment, res);
    },
    CommentCreate: function (req, res) {
        const { id_user, id_post, comment_text } = req.body;
        comments.AddComment(id_user, id_post, comment_text, res);
    },
    CommentEdit: function (req, res) {
        const { id_comment, comment_text } = req.body;
        comments.EditComment(id_comment, comment_text, res);
    },
    CommentLike: function (req, res) {
        const { id_comment, like_by } = req.body;
        comments.EditLikeComment(id_comment, like_by, res);
    },
    CommentDelete: function (req, res) {
        const { id_comment } = req.params;
        comments.DeleteComment(id_comment, res);
    }
}
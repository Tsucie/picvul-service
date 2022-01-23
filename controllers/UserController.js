const users = require("../models/users");

module.exports = {
    UserGetList: function (req, res) {
        const { filterByJob, page, pageLength } = req.body;
        users.ReadListUser(filterByJob, page, pageLength, res);
    },
    UserGetUpdates: function (req, res) {
        console.log(req.body);
        const { page, pageLength } = req.body;
        users.ReadUserUpdates(page, pageLength, res);
    },
    UserGetByID: function (req, res) {
        const { id_user } = req.body;
        users.ReadByIDUser(id_user, res);
    },
    UserEditData: function (req, res) {
        const { id_user, email, username, fullname, job, profile_image } = req.body;
        users.EditUser(id_user, email, username, fullname, job, profile_image, res);
    },
    UserEditPassword: function (req, res) {
        const { id_user, oldPassword, newPassword } = req.body;
        users.EditPassword(id_user, oldPassword, newPassword, res);
    },
    UserResetPassword: function (req, res) {
        const { email } = req.body;
        users.ResetPassword(email, res);
    },
    UserDeleteAccount: function (req, res) {
        const { id_user } = req.body;
        users.DeleteUser(id_user, res);
    }
}
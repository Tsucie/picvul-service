const users = require("../models/users");

module.exports = {
    UserGetList: function (req, res) {
        const { filterByFullName, filterByJob, page, pageLength } = req.body;
        users.ReadListUser(filterByFullName, filterByJob, page, pageLength, res);
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
    UserDeleteAccount: function (req, res) {
        const { id_user } = req.body;
        users.DeleteUser(id_user, res);
    }
}
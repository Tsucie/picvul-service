const categories = require('../models/categories');

module.exports = {
    GetAll: function (req, res) {
        categories.ReadAll(res);
    },
    GetData: function (req, res) {
        const { id } = req.body;
        categories.ReadByID(id, res);
    },
    AddData: function (req, res) {
        const { name } = req.body;
        categories.AddCategory(name, res);
    },
    EditData: function (req, res) {
        const { id, name } = req.body;
        categories.EditCategory(id, name, res);
    },
    DeleteData: function (req, res) {
        const { id } = req.body;
        categories.DeleteCategory(id, res);
    }
}
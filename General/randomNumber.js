const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    randomNumber: function (min = 0, max = Number(process.env.INT64_MAX)) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

module.exports = {
    randomNumber: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
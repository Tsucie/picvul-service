/* DateTime “Y-m-d H:i:s” handler */
module.exports = {
    Now: function () {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
}
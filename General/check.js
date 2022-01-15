module.exports = {
    isNull: function(data) {
        if (data === undefined || data === null || data === "") return true;
        else return false;
    }
}
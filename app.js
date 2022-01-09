const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const port = 5000;

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Routes


// App Port
app.listen(port, () => {
    console.log(`Service is listening on at http://localhost${port}`);
});
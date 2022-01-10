const Express = require("express");
const BodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
// const controller = require("./controllers");

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Routes
app.get("/");

// App Port
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Service is listening on at http://localhost:${process.env.SERVER_PORT}`);
});
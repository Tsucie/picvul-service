const Express = require("express");
const BodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const app = Express();
const auth = require("./controllers/AuthController");
const user = require("./controllers/UserController");

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Routes
app.post("/api/user/regist", auth.UserRegist);
// Authorized Routes
app.get("/api/user/getlist", user.UserGetList);
app.get("/api/user/getdata", user.UserGetByID);
app.put("/api/user/editdata", user.UserEditData);
app.put("/api/user/editpassword", user.UserEditPassword);
app.delete("/api/user/delete", user.UserDeleteAccount);

// App Port
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Service is listening on at http://localhost:${process.env.SERVER_PORT}`);
});
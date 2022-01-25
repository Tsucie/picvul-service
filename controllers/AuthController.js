const { Authentication, AddUser } = require("../models/users");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    Login: function (req, res) {
        try {
            const { email, password } = req.body;
            Authentication(email, password, (validation) => {
                if (!validation.result) {
                    return res.status(401).send({code: 401, message: "Email or Password is wrong"});
                }
                else {
                    if (validation.user.status == false)
                        return res.status(401).send({code: 401, message: "Account has deactivated"});
                    // Create and assign token
                    let payload = { id: validation.user.id_user, name: validation.user.fullname };
                    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
                    return res.status(200).send({
                        code: 200,
                        message: "Login Successfully 😏 🍀",
                        access_token: token,
                        httpOnly: true,
                        secure: process.env.APP_ENV === "production",
                        data: validation.user
                    });
                }
            });
        } catch (error) {
            return res.status(500).send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    },
    Authorization: function (req, res, next) {
        const authHeader = req.header("Authorization");
        const token = authHeader.split(" ")[1];
        try {
            if (!token) throw err;
            const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = data.name;
            return next();
        } catch (err) {
            return res.sendStatus(403);
        }
    },
    UserRegist: function (req, res) {
        const { email, username, fullname, password, job, profile_image } = req.body;
        AddUser(email, username, fullname, password, job, profile_image, res);
    },
    Logout: function (req, res) {
        try {
            // res.clearCookie("access_token");
            return res.send({ code: 200, message: "Successfully logged out 😏 🍀" });
        } catch (error) {
            return res.send({ code: 500, message: `Internal Server Error: ${error}` });
        }
    }
}
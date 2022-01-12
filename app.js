const Express = require("express");
const BodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const app = Express();
const auth = require("./controllers/AuthController");
const user = require("./controllers/UserController");
const post = require("./controllers/PostController");
const follow = require("./controllers/FollowController");
const comment = require("./controllers/CommentController");

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Unauthorized Routes
app.post("/api/user/regist", auth.UserRegist);
app.post("/login", auth.Login);

// Authorized Routes
app.get("/logout", auth.Authorization, auth.Logout);
app.get("/api/user/getlist", auth.Authorization, user.UserGetList);
app.get("/api/user/getdata", auth.Authorization, user.UserGetByID);
app.put("/api/user/editdata", auth.Authorization, user.UserEditData);
app.put("/api/user/editpassword", auth.Authorization, user.UserEditPassword);
app.delete("/api/user/delete", auth.Authorization, user.UserDeleteAccount);
app.get("/api/post/getlist", auth.Authorization, post.PostGetList);
app.get("/api/post/getdata", auth.Authorization, post.PostGetByID);
app.post("/api/post/create", auth.Authorization, post.PostCreate);
app.put("/api/post/edit", auth.Authorization, post.PostEdit);
app.put("/api/post/like", auth.Authorization, post.PostLike);
app.delete("/api/post/delete", auth.Authorization, post.PostDelete);
app.get("/api/getlistfollowing", auth.Authorization, follow.GetListFollowing);
app.get("/api/getlistfollower", auth.Authorization, follow.GetListFollower);
app.post("/api/follow", auth.Authorization, follow.UserFollow);
app.delete("/api/unfollow", auth.Authorization, follow.UserUnfollow);
app.get("/api/comment/getlist", auth.Authorization, comment.CommentGetList);
app.get("/api/comment/getdata", auth.Authorization, comment.CommentGetByID);
app.post("/api/comment/create", auth.Authorization, comment.CommentCreate);
app.put("/api/comment/edit", auth.Authorization, comment.CommentEdit);
app.put("/api/comment/like", auth.Authorization, comment.CommentLike);
app.delete("/api/comment/delete", auth.Authorization, comment.CommentDelete);

// App Port
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Service is listening on at ${process.env.APP_URL}:${process.env.SERVER_PORT}`);
});
const Express = require("express");
const BodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = Express();
const auth = require("./controllers/AuthController");
const user = require("./controllers/UserController");
const post = require("./controllers/PostController");
const follow = require("./controllers/FollowController");
const comment = require("./controllers/CommentController");
const categories = require("./controllers/CategoryController");
// set up rate limiter: maximum of five requests per minute
const RateLimit = require('express-rate-limit');
const limiter = RateLimit.rateLimit({
    windowMs: 1*60*1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// apply rate limiter to all requests
app.use(limiter);
app.use(cors());
app.use(cookieParser());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Unauthorized Routes
app.post("/regist", auth.UserRegist);
app.post("/login", auth.Login);
app.put("/reset-password", user.UserResetPassword);

/* Authorized Routes */
app.get("/logout", auth.Authorization, auth.Logout);
// Users Module
app.post("/api/user/get-list", auth.Authorization, user.UserGetList);
app.get("/api/user/:id_user", auth.Authorization, user.UserGetByID);
app.put("/api/user/edit-data", auth.Authorization, user.UserEditData);
app.put("/api/user/edit-password", auth.Authorization, user.UserEditPassword);
app.delete("/api/user/delete/:id_user", auth.Authorization, user.UserDeleteAccount);
app.post("/api/user/updates", auth.Authorization, user.UserGetUpdates);
// Posts Module
app.post("/api/post/get-list", auth.Authorization, post.PostGetList);
app.get("/api/post/userlikes/:id_user", auth.Authorization, post.PostGetUserLikes);
app.get("/api/post/:id_post", auth.Authorization, post.PostGetByID);
app.post("/api/post/upload", auth.Authorization, post.PostCreate);
app.put("/api/post/edit", auth.Authorization, post.PostEdit);
app.post("/api/post/like", auth.Authorization, post.PostLike);
app.put("/api/post/unlike", auth.Authorization, post.PostUnlike);
app.delete("/api/post/delete/:id_post", auth.Authorization, post.PostDelete);
// Follows Module
app.post("/api/get-list-following", auth.Authorization, follow.GetListFollowing);
app.post("/api/get-list-follower", auth.Authorization, follow.GetListFollower);
app.get("/api/follows/:id_user", auth.Authorization, follow.GetAllFollows);
app.post("/api/follow", auth.Authorization, follow.UserFollow);
app.put("/api/unfollow", auth.Authorization, follow.UserUnfollow);
// Comments Module
app.post("/api/comment/get-list", auth.Authorization, comment.CommentGetList);
app.get("/api/comment/:id_comment", auth.Authorization, comment.CommentGetByID);
app.post("/api/comment/create", auth.Authorization, comment.CommentCreate);
app.put("/api/comment/edit", auth.Authorization, comment.CommentEdit);
app.put("/api/comment/like", auth.Authorization, comment.CommentLike);
app.delete("/api/comment/delete/:id_comment", auth.Authorization, comment.CommentDelete);
// Categories Module
app.get("/api/category/get-list", auth.Authorization, categories.GetAll);
app.get("/api/category/:id", auth.Authorization, categories.GetData);
app.post("/api/category/add", auth.Authorization, categories.AddData);
app.put("/api/category/edit", auth.Authorization, categories.EditData);
app.delete("/api/category/delete/:id", auth.Authorization, categories.DeleteData);

// App Port
app.listen(process.env.PORT || 5000, () => {
    console.log(`Service is listening port:${process.env.PORT || 5000}`);
});
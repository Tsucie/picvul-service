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

app.use(cors());
app.use(cookieParser());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

// Unauthorized Routes
app.post("/api/user/regist", auth.UserRegist);
app.post("/login", auth.Login);

// Authorized Routes
app.get("/logout", auth.Authorization, auth.Logout);
app.post("/api/user/getlist", auth.Authorization, user.UserGetList);
app.get("/api/user/:id_user", auth.Authorization, user.UserGetByID);
app.put("/api/user/editdata", auth.Authorization, user.UserEditData);
app.put("/api/user/editpassword", auth.Authorization, user.UserEditPassword);
app.put("/api/user/resetpassword", user.UserResetPassword);
app.delete("/api/user/:id_user", auth.Authorization, user.UserDeleteAccount);
app.post("/api/updates", auth.Authorization, user.UserGetUpdates);

app.post("/api/post/getlist", auth.Authorization, post.PostGetList);
app.get("/api/post/:id_post", auth.Authorization, post.PostGetByID);
app.post("/api/post/upload", auth.Authorization, post.PostCreate);
app.put("/api/post/edit", auth.Authorization, post.PostEdit);
app.put("/api/post/like", auth.Authorization, post.PostLike);
app.delete("/api/post/:id_post", auth.Authorization, post.PostDelete);

app.post("/api/getlistfollowing", auth.Authorization, follow.GetListFollowing);
app.post("/api/getlistfollower", auth.Authorization, follow.GetListFollower);
app.get("/api/follows/:id_user", auth.Authorization, follow.GetAllFollows);
app.post("/api/addfollow", auth.Authorization, follow.UserFollow);
app.put("/api/unfollow", auth.Authorization, follow.UserUnfollow);

app.post("/api/comment/getlist", auth.Authorization, comment.CommentGetList);
app.get("/api/comment/:id_comment", auth.Authorization, comment.CommentGetByID);
app.post("/api/comment/create", auth.Authorization, comment.CommentCreate);
app.put("/api/comment/edit", auth.Authorization, comment.CommentEdit);
app.put("/api/comment/like", auth.Authorization, comment.CommentLike);
app.delete("/api/comment/:id_comment", auth.Authorization, comment.CommentDelete);

app.get("/api/category/getlist", auth.Authorization, categories.GetAll);
app.get("/api/category/:id", auth.Authorization, categories.GetData);
app.post("/api/category/add", auth.Authorization, categories.AddData);
app.put("/api/category/edit", auth.Authorization, categories.EditData);
app.delete("/api/category/:id", auth.Authorization, categories.DeleteData);

// App Port
app.listen(process.env.PORT || 5000, () => {
    console.log(`Service is listening port:${process.env.PORT || 5000}`);
});
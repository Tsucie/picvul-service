# picvul-service v1.0.0
BackEnd Service for picvul app

## Software Requirement
- Node.js (v16.13.1^)
- Express (v4.17.2^)
- express-basic-auth (v1.2.1^)
- cookie-parser (v1.4.6^)
- jsonwebtoken (v8.5.1^)
- mongodb (v4.3.0^)
- body-parser (v1.19.1^)
- dotenv (v10.0.0^)
- bcrypt (v5.0.1^)
- cors (v2.8.5^)
- nodemailer (v6.7.2^)

## Other Tools
- Nodemon (2.0.15^)
- Postman

## Installation
- `npm init`
- `npm i express express-basic-auth cookie-parser jsonwebtoken mongodb body-parser dotenv bcrypt cors nodemailer`
- `npm i --save-dev nodemon`
- Change `.env.example` file name to `.env`

## Running Service
- `npm start`

## API List
### Users
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| Regist | `POST` | `/regist` | body **json**: `{email:string, username:string, fullname:string, password:string, job:string, profile_image:stringpath}` | Create user account
| Login | `POST` | `/login` | body **json**: `{email:string, password:string}` | Login user account
| Logout | `GET` | `/logout` | header **Bearer Token**: `generated jwt token from login` | Logout user account
| GetList | `POST` | `/api/user/getlist` | header **Bearer Token** & body **json**: `{filterByJob:string, page:number, pageLength:number}` | Get Paginated List of user account
| GetByID | `GET` | `/api/user/:id_user` | header **Bearer Token** & route **param**: `id_user:ObjectID(string)` | Get specific user account
| Edit | `PUT` | `/api/user/editdata` | header **Bearer Token** & body **json**: `{id_user:ObjectID(string), edited fields}` | Edit data of user account
| EditPassword | `PUT` | `/api/user/editpassword` | header **Bearer Token** & body **json**: `{id_user:ObjectID(string), oldPassword:string, newPassword:string}` | Edit password of user account
| ResetPassword | `PUT` | `/api/user/resetpassword` | header **Bearer Token** & body **json**: `{email: string}` | Reset password of user account
| Delete | `DELETE` | `/api/user/:id_user` | header **Bearer Token** & route **param**: `id_user:ObjectID(string)` | Delete user account data

### Follows
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| GetUserFollows | `GET` | `/api/follows/:id_user` | header **Bearer Token** & route **param**: `id_user:ObjectID(string)` | Get Following and Follower of specific user
| GetListFollowing | `POST` | `/api/getlistfollowing` | header **Bearer Token** & body **json**: `{follower_id_user:ObjectID(string), page:number, pageLength:number}` | Get Following Paginated List of specific user
| GetListFollower | `POST` | `/api/getlistfollower` | header **Bearer Token** & body **json**: `{following_id_user:ObjectID(string), page:number, pageLength:number}` | Get Follower Paginated List of specific user
| AddFollow | `POST` | `/api/addfollow` | header **Bearer Token** & body **json**: `{follower_id_user:ObjectID(string), following_id_user:ObjectID(string)}` | User follow
| UnFollow | `PUT` | `/api/unfollow` | header **Bearer Token** & body **json**: `{follower_id_user:ObjectID(string), following_id_user:ObjectID(string)}` | User unfollow

### Categories
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| GetList | `POST` | `/api/category/getlist` | header **Bearer Token** & body **json**: `{page:number, pageLength:number, filterByCategory:string, sortBy:string}` | Get Paginated List of category
| GetData | `GET` | `/api/category/:id` | header **Bearer Token** & route **param**: `id:ObjectID(string)` | Get Detail category
| Add | `POST` | `/api/category/upload` | header **Bearer Token** & body **json**: `{name:string}` | Add category
| Edit | `PUT` | `/api/category/edit` | header **Bearer Token** & body **json**: `{id:ObjectID(string), edited fields}` | Edit category
| Delete | `DELETE` | `/api/category/:id` | header **Bearer Token** & route **param**: `id:ObjectID(string)` | Delete category

### Posts
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| GetList | `POST` | `/api/post/getlist` | header **Bearer Token** & body **json**: `{page:number, pageLength:number, filterByCategory:string, sortBy:string}` | Get Paginated List of Post
| GetData | `GET` | `/api/post/:id_post` | header **Bearer Token** & route **param**: `{id_post:ObjectID(string)}` | Get Detail Post
| Upload | `POST` | `/api/post/upload` | header **Bearer Token** & body **json**: `{id_user:ObjectID(string), categories:Array, title:string, desc:string, post_images:ArrayObject[{idx:number, path:stringpath}]}` | Upload Image Post
| Edit | `PUT` | `/api/post/edit` | header **Bearer Token** & body **json**: `{id_post:ObjectID(string), edited fields}` | Edit Image Post
| Like | `PUT` | `/api/post/like` | header **Bearer Token** & body **json**: `{id_post:ObjectID(string), like_by:string username}` | Like Image Post
| Delete | `DELETE` | `/api/post/:id_post` | header **Bearer Token** & route **param**: `id_post:ObjectID(string)` | Delete Post

### Comments
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| GetList | `POST` | `/api/comment/getlist` | header **Bearer Token** & **json**: `{id_post:ObjectID(string), page:number, pageLength:number}` | Get Paginated List of user comment
| GetData | `GET` | `/api/comment/:id_comment` | header **Bearer Token** & route **param**: `id_comment:ObjectID(string)` | Get Specified data of user comment
| Create | `POST` | `/api/comment/create` | header **Bearer Token** & **json**: `{id_post:ObjectID(string), id_user:ObjectID(string), comment_text:string}` | Create comment in a Post
| Edit | `PUT` | `/api/comment/edit` | header **Bearer Token** & **json**: `{id_comment:ObjectID(string), comment_text:string}` | Edit comment in a Post
| Like | `PUT` | `/api/comment/like` | header **Bearer Token** & **json**: `{id_comment:ObjectID(string), like_by:string username}` | Like comment in a Post
| Like | `DELETE` | `/api/comment/:id_comment` | header **Bearer Token** & route **param**: `id_comment:ObjectID(string)` | Delete comment in a Post

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

## Other Tools
- Nodemon (2.0.15^)
- Postman

## Installation
- `npm init`
- `npm i express express-basic-auth cookie-parser jsonwebtoken mongodb body-parser dotenv bcrypt cors`
- `npm i --save-dev nodemon`
- Change `.env.example` file name to `.env`

## Running Service
- `npm start`

## API List (Soon)
### Users
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| Regist | `POST` | `/api/user/regist` | body **json**: `{email:string, username:string, fullname:string, password:string, job:string, profile_image:stringpath}` | Create user account
| Login | `POST` | `/login` | body **json**: `{email:string, password:string}` | Login user account
| Logout | `GET` | `/logout` | header **Bearer Token**: `generated jwt token from login` | Logout user account
| GetList | `GET` | `/api/user/getlist` | header **Bearer Token** & body **json**: `{filterByJob:string, page:number, pageLength:number}` | Get Paginated List of user account
| GetByID | `GET` | `/api/user/getdata` | header **Bearer Token** & body **json**: `{id_user:ObjectID(string)}` | Get specific user account
| Edit | `PUT` | `/api/user/editdata` | header **Bearer Token** & body **json**: `{id_user:ObjectID(string), edited fields}` | Edit data of user account
| EditPassword | `PUT` | `/api/user/editpassword` | header **Bearer Token** & body **json**: `{id_user:ObjectID(string), oldPassword:string, newPassword:string}` | Edit password of user account
| Delete | `DELETE` | `/api/user/delete` | header **Bearer Token** & body **json**: `{id_user:ObjectID(string)}` | Delete user account data

### Follows
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| GetUserFollows | `GET` | `/api/follows` | header **Bearer Token** & **json**: `{id_user:ObjectID(string)}` | Get Following and Follower of specific user
| GetListFollowing | `GET` | `/api/getlistfollowing` | header **Bearer Token** & **json**: `{follower_id_user:ObjectID(string), page:number, pageLength:number}` | Get Following Paginated List of specific user
| GetListFollower | `GET` | `/api/getlistfollower` | header **Bearer Token** & **json**: `{following_id_user:ObjectID(string), page:number, pageLength:number}` | Get Follower Paginated List of specific user
| AddFollow | `POST` | `/api/addfollow` | header **Bearer Token** & **json**: `{follower_id_user:ObjectID(string), following_id_user:ObjectID(string)}` | User follow
| UnFollow | `DELETE` | `/api/unfollow` | header **Bearer Token** & **json**: `{follower_id_user:ObjectID(string), following_id_user:ObjectID(string)}` | User unfollow

### Posts
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| GetList | `GET` | `/api/post/getlist` | header **Bearer Token** & **json**: `{page:number, pageLength:number, filterByCategory:string, sortBy:string}` | Get Paginated List of Post
| GetData | `GET` | `/api/post/getdata` | header **Bearer Token** & **json**: `{id_post:ObjectID(string)}` | Get Detail Post
| Upload | `POST` | `/api/post/upload` | header **Bearer Token** & **json**: `{id_user:ObjectID(string), categories:Array, title:string, desc:string, post_images:ArrayObject[{idx:number, path:stringpath}]}` | Upload Image Post
| Edit | `PUT` | `/api/post/edit` | header **Bearer Token** & **json**: `{id_post:ObjectID(string), edited fields}` | Edit Image Post
| Like | `PUT` | `/api/post/like` | header **Bearer Token** & **json**: `{id_post:ObjectID(string), like_by:string username}` | Like Image Post
| Delete | `DELETE` | `/api/post/delete` | header **Bearer Token** & **json**: `{id_post:ObjectID(string)}` | Like Image Post

### Comments
|Feature         |Method          |uri                            |Requirement Parameter        |Description
|----------------|----------------|-------------------------------|-----------------------------|-----------
| GetList | `GET` | `/api/comment/getlist` | header **Bearer Token** & **json**: `{id_post:ObjectID(string), page:number, pageLength:number}` | Get Paginated List of user comment
| GetData | `GET` | `/api/comment/getdata` | header **Bearer Token** & **json**: `{id_comment:ObjectID(string)}` | Get Specified data of user comment
| Create | `POST` | `/api/comment/create` | header **Bearer Token** & **json**: `{id_post:ObjectID(string), id_user:ObjectID(string), comment_text:string}` | Create comment in a Post
| Edit | `PUT` | `/api/comment/edit` | header **Bearer Token** & **json**: `{id_comment:ObjectID(string), comment_text:string}` | Edit comment in a Post
| Like | `PUT` | `/api/comment/like` | header **Bearer Token** & **json**: `{id_comment:ObjectID(string), like_by:string username}` | Like comment in a Post
| Like | `DELETE` | `/api/comment/delete` | header **Bearer Token** & **json**: `{id_comment:ObjectID(string)}` | Delete comment in a Post

// controller layer
const express = require("express");
const router = express.Router();
const postService = require("../service/postService");
const userService = require("../service/userService");
const {authenticateToken, decodeJWT} = require("../util/jwt");
const { logger } = require("../util/logger");


//get feed for current user  
router.get("/feed", authenticateToken, async(req, res) =>{
    const user = req.user;
    const data = await postService.getUserFeed(user.id);
    if (data){
        res.status(200).json({message: `User feed for ${user.username}`, data: data});
    } else {
        res.status(400).json({message: `Unable to retrieve feed for ${user.username}. Try again.`});
    }
})

//get posts from certain user 
router.get("/post-history", authenticateToken, authorizedViewer, async(req, res) =>{
    const {userID} = req.query;
    const data = await postService.getPostsFromUser(userID);
    if (data){
        res.status(200).json({message: `All posts from user.`, data: data.Items});
    } else {
        res.status(400).json({message: `Unable to retrieve posts. Try again.`, data:req.body});
    }
})

// create post
router.post("/", authenticateToken, async(req, res) => {
    const currUser = req.user;
    //console.log(currUser);
    const data = await postService.createPost(currUser.id, req.body);
     if (data){
        res.status(201).json({message: `Post created successfully.`, data:data});
    } else {
        res.status(400).json({message: `Unable to create post. Try again.`, data:req.body});
    }
})

// delete post
router.delete("/", authenticateToken, async(req, res) =>{
    const {postID} = req.query;
    const currUser = req.user;
    const data = await postService.deletePost(currUser.id, postID);
     if (data){
        res.status(200).json({message: `Post deleted successfully.`});
    } else {
        res.status(400).json({message: `Unable to delete post. Try again.`});
    }
})

// middleware

// ensure currUser follows userID to view userID post
async function authorizedViewer(req, res, next){
    // user must be loking at own post history or follow user from query 
    const currUser = req.user;
    const {userID} = req.query;

    const user = await userService.getUserById(currUser.id);
    const followingList = user.following;
    //console.log(user.following);

    if (currUser.id == userID || (followingList.size > 0 && followingList.has(userID))){
        next();
    } else {
        res.status(400).json({message: `Not allowed to view posts.`});
 
    }
}
module.exports = router;
// controller layer
const express = require("express");
const router = express.Router();
const postService = require("../service/postService");
const {authenticateToken} = require("../util/jwt");
const { logger } = require("../util/logger");

//get posts from certain user 
router.get("/post-history", authenticateToken, async(req, res) =>{
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
    const data = await postService.createPost(currUser.username, req.body);
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
    const data = await postService.deletePost(currUser.username, postID);
     if (data){
        res.status(200).json({message: `Post deleted successfully.`});
    } else {
        res.status(400).json({message: `Unable to delete post. Try again.`});
    }
})

module.exports = router;
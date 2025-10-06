// service layer 
const {logger} = require("../util/logger");
const postRepository = require("../repository/postRepository");
const userService = require("../service/userService");

// ensure post has neccessary attributes 
// playlist link 
// acitivty type
// caption optional 
// media optional
function validatePost(postInfo){
    const playlistLink = postInfo.playlist_spotifyURI;
    const activityType = postInfo.pst_activityType;
    return playlistLink && activityType;   
}

// get a user's feed/timeline 
async function getUserFeed(userID){
    try{
        const user = await userService.getUserById(userID);
    
        const followingList = user.usr_following; 
        const feed = []
        for (var user_id of followingList){
            const data = await postRepository.getPostsFromUser(user_id);
            if(data){
                for (var post of data.Items){
                    feed.push(post);
                }
            }
        }
        feed.sort().reverse();

        logger.info(feed);
        return feed;

    } catch (err){
        logger.error(err);
        return null;
    }
    
}

// get all posts from specific user 
async function getPostsFromUser(userID){
    try {
        const data = await postRepository.getPostsFromUser(userID);
        if (data){
            logger.info(`Succesfully got posts from user.`, data);
            return data;
        } else{
            logger.error(`Unable to get posts from user.`);
            return null;
        }
    } catch (err) {
        logger.error(err);
        return null;
    }
}

//create post
async function createPost(username, postInfo){
    try{
        const user = await userService.getUserByUsername(username);
        if (validatePost(postInfo)){
            const data = await postRepository.putPost({
                PK: user.PK,
                SK: crypto.randomUUID(),
                username: username,
                playlist_spotifyURI: postInfo.playlist_spotifyURI,
                pst_caption: postInfo.pst_caption,
                pst_timestamp: Date.now(),
                ... postInfo
            });
            if (data){
                logger.info(`Successfully created post`, data);
                return data;
            } else{
                logger.error(`Failure to create post.`);
                return null;
            }
        } else {
            logger.error(`Missing fields.`);
            return null;
        }
    } catch(err){
        logger.error(err);
        return null;
    }
    
}

// delete post
async function deletePost(username, postID){
    try{
        const user = await userService.getUserByUsername(username);
        const data = await postRepository.deletePost(user.PK, postID);
        if (data){
            logger.info(`Successfully deleted post`, data);
            return data;
        } else {
            logger.error(`Unable to delete post`, data);
            return null;
        }
    } catch (err){
        logger.error(err);
        return null;
    }
   
}

module.exports = {validatePost, createPost, deletePost, getPostsFromUser, getUserFeed};
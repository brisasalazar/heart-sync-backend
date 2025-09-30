// service layer 
const {logger} = require("../util/logger");
const postRepository = require("../repository/postRepository");

// ensure post has neccessary attributes (
// playlist link 
// acitivty type
// caption optional 
// media optional
function validatePost(postInfo){
    const playlistLink = postInfo.playlist_spotifyURI;
    const activityType = postInfo.pst_activityType;
    return playlistLink && activityType;   
}
// get all posts from specific user 
async function getPostsFromUser(userID){
    const data = await postRepository.getPostsFromUser(userID);
    if (data){
        logger.info(`Succesfully got posts from user.`, data);
        return data;
    } else{
        logger.error(`Unable to get posts from user.`);
    }
}

//create post
// get the user id as sort key (in controller layer from jwt)
async function createPost(userID, postInfo){
    if (validatePost){
        const data = await postRepository.putPost({
            PK: crypto.randomUUID(),
            SK: userID,
            playlist_spotifyURI: postInfo.playlist_spotifyURI,
            pst_caption: postInfo.pst_caption,
            ... postInfo
        });
         if (data){
            logger.info(`Successfully created post`, data);
            return data;
        } else {
            logger.error(`Failure to create post`, data);
            return null;
        }
    } else {
        logger.error(`Missing fields.`, data);
    }
}

// delete post
async function deletePost(postID){
    const data = postRepository.deletePost(postID);
    if (data){
        logger.info(`Successfully deleted post`, data);
        return data;
    } else {
        logger.error(`Unable to delete post`, data);
        return null;
    }
}

module.exports = {createPost, deletePost, getPostsFromUser};
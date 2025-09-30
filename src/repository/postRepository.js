/**
 * POSTS DAO
 * 
 * All post objects should contain the following information:
 * - Username (req)
 * - Playlist link (req)
 * - User_id (req) ?
 * - Type of activity (run, walk, hike, cycling, yoga, other) - do we want this to be a set list? dropdown menu in the frontend 
 * - Media attachment (this will be a hyperlink for a S3 object, ie photos)
 * - Caption 
 * - post_id (req) (autogen) (will be of the following format p#someuuid)
 * 
 */

// imports 
// import aws sdk clients, dyanodb, and fs modules 
const { DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand, UpdateCommand} = require("@aws-sdk/lib-dynamodb")

const {logger} = require("../util/logger");

const client = new DynamoDBClient({region: "us-east-1"});

const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "heart-sync";

// get all posts by user 
async function getPostsFromUser(userID){
    const command = new QueryCommand({
        TableName,
        KeyConditionExpression: "PK = :userID AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {":userID" :`USER#${userID}`, ":sk" : "POST#"}
    })
    try{
        const data = await documentClient.send(command);
        logger.info("GET command successful.");
        return data;
    } catch(err){
        logger.error(err);
        return null;
    }
}

// get post by its id
async function getPostByID(postID){
    const command = new QueryCommand({
        TableName,
        KeyConditionExpression: "PK = :postID",
        ExpressionAttributeValues: {":postID" : `POST#${postID}`}
    })
    try{
        const data = await documentClient.send(command);
        logger.info("GET command successful.");
        return data;
    } catch(err){
        logger.error(err);
        return null;
    }
}


// create a post 
async function putPost(postInfo){
    const command = new PutCommand({
        TableName, 
        Item:{
            PK: `POST#${postInfo.postID}`,
            SK: `USER#${postInfo.postedBy}`,
            pst_caption: postInfo.pst_caption,
            pst_activityType: postInfo.pst_activityType,
            playlist_spotifyURI: postInfo.playlistLink, 
            pst_media: postInfo.media
        }
    })
    try{
        const data = await documentClient.send(command);
        logger.info(`PUT command completed`, data);
        return data;
    } catch (err){
        logger.error(`Unable to complete command`, err);
        return null;
    }
} 

// let postInfo = {
//     postID: "88af52e6-0045-4319-a676-9ce0ce88d519",
//     postedBy: "858ff59f-d1e4-4297-8466-dbe33fd3dfd0",
//     pst_activityType: "walk",
//     pst_caption: "this is my super cool caption!",
//     playlistLink: "https://open.spotify.com/playlist/3WZazHbTGSUv6zRxavQcla?si=1a1d9dcabd484e32"
// }
// putPost(postInfo);


// delete post
async function deletePost(postID){
    try{
        const post = await getPostByID(postID);
        const sk = post.Items.at(0).SK;
        const command = new DeleteCommand({
            TableName, 
            Key: {
                PK: `POST#${postID}`, 
                SK: sk
            }
        });
        try{
            const data = await documentClient.send(command);
            logger.info(`DELETE command successful.`, data);
            return data;
        } catch (err){
            logger.error(err);
            return null;
        }
    } catch (err){
        logger.error(`Post not found.`);
        return null;
    }
}   
//deletePost("88af52e6-0045-4319-a676-9ce0ce88d519");

module.exports = {getPostByID, getPostsFromUser, putPost, deletePost}

/**
 * POSTS DAO
 * 
 * All post objects should contain the following information:
 * - Username (req)
 * - Playlist link (req)
 * - User_id (req) 
 * - Type of activity (req) (run, walk, hike, cycling, yoga, other) - do we want this to be a set list? dropdown menu in the frontend 
 * - Media attachment (this will be a hyperlink for a S3 object, ie photos)
 * - Caption 
 * - post_id (req) (autogen) (will be of the following format p#someuuid)
 */

// imports 
// import aws sdk clients, dyanodb, and fs modules 
const { DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand, UpdateCommand} = require("@aws-sdk/lib-dynamodb")

const {logger} = require("../util/logger");

const client = new DynamoDBClient({region: "us-east-1"});

const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "heart-sync"; // update tabel name with personal table name

// get all posts by user 
async function getPostsFromUser(userID){
    const command = new QueryCommand({
        TableName,
        KeyConditionExpression: "PK = :userID AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {":userID" : `USER#${userID}`, ":sk" : "POST#"}
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
async function getPostByID(userID, postID){
    const command = new QueryCommand({
        TableName,
        KeyConditionExpression: "PK = :userID AND SK = :postID",
        ExpressionAttributeValues: {":userID" : `USER#${userID}`, ":postID" : `POST#${postID}`}
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
            PK: postInfo.PK,
            SK: `POST#${postInfo.SK}`, 
            username: postInfo.username,
            pst_caption: postInfo.pst_caption,
            pst_activityType: postInfo.pst_activityType,
            playlist_spotifyURI: postInfo.playlist_spotifyURI,
            pst_media: postInfo.pst_media
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

// delete post
async function deletePost(userID, postID){
    try{
        const command = new DeleteCommand({
            TableName, 
            Key: {
                PK: userID,
                SK: `POST#${postID}`
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

module.exports = {getPostByID, getPostsFromUser, putPost, deletePost}

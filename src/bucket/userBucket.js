
const { logger } = require("../util/logger");
const fs = require("fs");
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require ("@aws-sdk/client-s3");
const{ getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = new S3Client({ region: "us-east-1" });

const bucketName = "heart-sync-images";

let fileBuffer;

async function getProfilePic(key){
    const command = new GetObjectCommand({
        Bucket: bucketName, 
        Key: key,
    });
    try{
        const signedURL= await getSignedUrl(client, command, {expiresIn:3600});
        logger.info(`GET Object Signed URL successful`, signedURL);
        return signedURL;
    } catch (err){
        logger.error("Failed GET Object URL", err);
        return null;
    }
};


async function addProfilePic(key){

    const command = new PutObjectCommand({
                Bucket: bucketName, 
                //Body: fileBuffer,
                Key: key,
                ContentType: "image/jpeg",
            });

    try{
        const signedURL = await getSignedUrl(client, command, {expiresIn:3600});
        logger.info("PUT Object Command URL successful", signedURL);
        return signedURL;
    } catch (err){
        logger.error("Failed PUT Object Command URL", err);
        return null;
    }
};


async function deleteProfilePic(key){
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
    });
    try{
        const response = await client.send(command);
        logger.info("DELETE Object Command successful", response);
        return response;
    } catch (err){
        logger.error("Failed DELETE Object Command.");
        return null;
    }
};


module.exports = {getProfilePic, addProfilePic, deleteProfilePic};
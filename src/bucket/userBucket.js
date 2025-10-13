
const { logger } = require("../util/logger");
const fs = require("fs");
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsCommand } = require ("@aws-sdk/client-s3");
const{ getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = new S3Client({ region: "us-east-1" });

const bucketName = "heart-sync-images";

let fileBuffer;

async function keyExists(key){
    const command = new HeadObjectCommand({
        Bucket: bucketName, 
        Key: key
    });
    try{
        await client.send(command);
        logger.info(`HEAD Object Command successful - key found: ${key}`);
        return true;
    } catch(err) {
        logger.error("Key not found", err);
        return false;
    }
}
async function getKeyFromPrefix(prefix){
    const command = new ListObjectsCommand({
        Bucket: bucketName,
        Prefix: prefix
    });
    try{
        const response = await client.send(command);
        logger.info("List Command successful", response);

        if (!response.Contents || response.Contents.length === 0) return null;
        return response.Contents[0].Key;

    } catch (err) {
        logger.error("Error wih LIST Command", err);
        return null;
    }
}
async function getProfilePic(prefix){
    try{
        // const keyData = await keyExists(key);
        // if (!keyData){
        //     logger.warn(`Key does not exist: ${key}`);
        //     return null;
        // }
        const key = await getKeyFromPrefix(prefix);
        if (!key) return null;

        const command = new GetObjectCommand({
            Bucket: bucketName, 
            Key: key,
        });
        
        const signedURL = await getSignedUrl(client, command, {expiresIn:3600});
        console.log(signedURL);
        logger.info(`GET Object Signed URL successful for key: ${key}`);
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


module.exports = {getProfilePic, addProfilePic, deleteProfilePic, keyExists};
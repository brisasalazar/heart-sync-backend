
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

// getProfilePic("brisasalazar/Brisita-86.jpeg");

async function addProfilePic(filePath, key){
    console.log(filePath);
    try {
        if (!fs.existsSync(filePath)) {
            logger.error(`File does not exist: ${filePath}`);
            return null;
        }
        
        fileBuffer = fs.readFileSync(filePath);
        logger.info(`Successfully read file: ${filePath}, size: ${fileBuffer.length} bytes`);
        
    } catch (fileError) {
        logger.error(`Failed to read file: ${filePath}`, fileError);
        return null;
    }

    const command = new PutObjectCommand({
                Bucket: bucketName, 
                Body: fileBuffer,
                Key: key,
                ContentType: "image/jpeg",
            });

    try{
        const response = await client.send(command);
        logger.info("PUT Object Command successful", response);
        return response;
    } catch (err){
        logger.error("Failed PUT Object Command.", err);
        return null;
    }
};

// addProfilePic(
//     "/Users/brisasalazar/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Brisita-86.jpeg",
//     "brisasalazar/Brisita-86.jpeg"  
// );

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

// deleteProfilePic("brisasalazar/Brisita-86.jpeg");

module.exports = {getProfilePic, addProfilePic, deleteProfilePic};
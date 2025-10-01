//imports 
const {logger} = require("../util/logger");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({region: "us-east-1"});
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "HeartSync";
// double check the database name on your specific implementation

//logic
async function postUser(user) {
    const command = new PutCommand({
        TableName,
        Item: user
    });

    try{
        const data = await documentClient.send(command);
        logger.info(`PUT command to database complete ${JSON.stringify(data)}`);
        return data;
    }catch(error){
        logger.error(error);
        return null;
    }
}


async function getUserByUsername(username) {
    // currently uses a SCAN command to get the user by their username
    // This will work for now, but it is not the most efficient way possible
    const command = new ScanCommand({
        TableName,
        FilterExpression: "#username = :username",
        ExpressionAttributeNames: {"#username": "username"},
        ExpressionAttributeValues: {":username": username}
    });

    try{
        const data = await documentClient.send(command);
        logger.info(`SCAN command to database complete ${JSON.stringify(data)}`);
        //console.log(data);
        //console.log(data.Items[0]);
        return data.Items[0];
    } catch(error) {
        logger.error(error);
        return null;
    }
}

//getUserByUsername("revature101");

// async function getUserbyUserId(user_id) {
//     const params = {
//         TableName,
//         KeyConditionExpression:
//     }
// }


//exports
module.exports = {
    postUser,
    getUserByUsername,
}
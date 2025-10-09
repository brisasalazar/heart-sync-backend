//imports 
const {logger} = require("../util/logger");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand, UpdateCommand, DeleteCommand} = require("@aws-sdk/lib-dynamodb");

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

async function updateUserDescription(user_id, newDescription) {
    const command = new UpdateCommand({
        TableName,
        Key: {
            PK: user_id,
            SK: 'METADATA'
        },
        UpdateExpression: "set #description = :description",
        ExpressionAttributeNames: {
            "#description": "description"
        },
        ExpressionAttributeValues: {
            ":description": newDescription
        }
    })

    try {
        const data = await documentClient.send(command);
        logger.info(`UPDATE command to databse complete ${JSON.stringify(data)}`);
        return data;
    }catch(error){
        logger.error(error);
        return null;
    }
}

// this would only allow you to update one field at a time
//async function updateUserFields(user_id, fieldName, fieldValue) {
async function updateUserFields(user_id, updateFields) {
    
    let UpdateExpression = 'SET ';
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    let updateExpressionParts = [];

    for (const fieldName in updateFields) {
        if (Object.hasOwnProperty.call(updateFields, fieldName)) {
            const fieldAlias = `#${fieldName}`;
            const valueAlias = `:${fieldName}`;

            updateExpressionParts.push(`${fieldAlias} = ${valueAlias}`);
            ExpressionAttributeNames[fieldAlias] = fieldName;
            ExpressionAttributeValues[valueAlias] = updateFields[fieldName];
        }
    }

    UpdateExpression += updateExpressionParts.join(', ');

    const command = new UpdateCommand({
        TableName,
        Key: {
            PK: user_id,
            SK: 'METADATA'
        },
        //UpdateExpression: `set #${fieldName} = :${fieldName}`,
        UpdateExpression: UpdateExpression,

        ExpressionAttributeNames: ExpressionAttributeNames,
        ExpressionAttributeValues: ExpressionAttributeValues,
    })

    try {
        const data = await documentClient.send(command);
        logger.info(`UPDATE command to databse complete ${JSON.stringify(data)}`);
        return data;
    }catch(error){
        logger.error(error);
        return null;
    }
}

async function deleteUser(user_id) {
    const command = new DeleteCommand({
        TableName,
        Key: {
            PK: user_id,
            SK: 'METADATA'
        },
        ReturnValues: 'ALL_OLD',
        // returns the actual values of the item(s) that are deleted
    })

    try {
        const data = await documentClient.send(command);
        logger.info(`DELETE command to databse complete ${JSON.stringify(data.Attributes)}`);
        //console.log(data.Attributes);
        return data.Attributes;
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
        return data.Items[0];
    } catch(error) {
        logger.error(error);
        return null;
    }
}

async function getUserByEmail(email) {
    const command = new ScanCommand({
        TableName,
        FilterExpression: "#email = :email",
        ExpressionAttributeNames: {"#email": "email"},
        ExpressionAttributeValues: {":email": email}
    }); 

    try{
        const data = await documentClient.send(command);
        logger.info(`SCAN command to database complete ${JSON.stringify(data)}`);
        return data.Items[0];
    } catch(error) {
        logger.error(error);
        return null;
    }
}

// This function uses a queryCommand to efficiently pull a user by their ID,
// This function will be used with the login token to quickly pull up a user to edit
async function getUserbyUserId(user_id) {
    const command = new QueryCommand({
        TableName,
        // pulls user directly by their primary key and sorting key without having to use a SCAN command
        KeyConditionExpression: "#PK = :pkValue and #SK = :skValue",
        ExpressionAttributeNames: {
            "#PK": "PK",
            "#SK": "SK"
        },
        ExpressionAttributeValues: {
            ':pkValue': user_id,
            ':skValue': 'METADATA'
        }
    })

    try{
        const data = await documentClient.send(command);
        logger.info(`Query command to database complete ${JSON.stringify(data)}`);
        //console.log(data.Items[0]);
        return data.Items[0];
    } catch(error) {
        logger.error(error);
        return null;
    }
}


//getUserbyUserId("USER#useraa202bd5-4b05-427e-8f1d-9997fef3a23f");


//exports
module.exports = {
    postUser,
    getUserByUsername,
    getUserByEmail,
    getUserbyUserId,
    updateUserDescription,
    updateUserFields,
    deleteUser,
}
const { logger } = require("../util/logger");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "HeartSync";

async function createPlaylist(userId, playlist) {
    if (userId && playlist) {
        const item = {
            PK: userId,
            SK: `PLAYLIST#Playlist${playlist.playlistId}`,
            playlistName: playlist.playlistName,
            description: playlist.description,
            // songIds: playlist.songIds,
            timestamp: Date.now()
        };

        const command = new PutCommand({
            TableName,
            Item: item
        });

        try {
            await documentClient.send(command);
            return item;
        } catch (error) {
            logger.error(`Error adding new playlist in playlistDAO: ${error.message}`);
            return null;
        }
    } else {
        throw new Error("New playlist information not provided to the repository layer.");
    }
}

async function addSongsToPlaylist(userId, playlistId, songIdArray) {
    if (userId && playlistId && songIdArray) {
        const command = new UpdateCommand({
            TableName,
            Key: {
                PK: userId,
                SK: `PLAYLIST#Playlist${playlistId}`,
            },
            UpdateExpression: "set #songIds = :songIds",
            ExpressionAttributeNames: {
                "#songIds": "songIds"
            },
            ExpressionAttributeValues: {
                ":songIds": songIdArray
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
}

async function getPlaylistsByUser(userId) {
    if (userId) {
        const command = new QueryCommand({
            TableName,
            KeyConditionExpression: "#PK = :pkValue AND begins_with(#SK, :skValue)",
            ExpressionAttributeNames: {
                "#PK": "PK",
                "#SK": "SK"
            },
            ExpressionAttributeValues: {
                ":pkValue": userId,
                ":skValue": "PLAYLIST#"
            }
        });

        try {
            const result = await documentClient.send(command);
            return result.Items || [];
        } catch (error) {
            logger.error(`Error retrieving playlists by user in playlistDAO: ${error.message}`);
            return null;
        }
    } else {
        throw new Error("User ID not provided to the repository layer: getPlaylistsByUser.");
    }
}

async function getPlaylistbyPlaylistId(userId, playlistId) {
    if (userId && playlistId) {
        const command = new QueryCommand({
            TableName,
            KeyConditionExpression: "#PK = :pkValue AND #SK = :skValue",
            ExpressionAttributeNames: {
                "#PK": "PK",
                "#SK": "SK"
            },
            ExpressionAttributeValues: {
                ":pkValue": userId,
                ":skValue": `PLAYLIST#Playlist${playlistId}`
            }
        });

        try {
            const result = await documentClient.send(command);
            return result.Items || null;
        } catch (error) {
            logger.error(
                `Error retrieving playlist with ID ${playlistId} from user with ID ${userId}: ${error.message}`
            );
            return null;
        }
    } else {
        throw new Error("User ID and/or playlist ID not provided to the repository layer: getPlaylist.");
    }
}

async function deletePlaylist(userId, playlistId) {
    if (userId && playlistId) {
        const command = new DeleteCommand({
            TableName,
            Key: {
                PK: userId,
                SK: `PLAYLIST#Playlist${playlistId}`
            },
            ReturnValues: 'ALL_OLD',
        });

        try {
            await documentClient.send(command);
            return {
                userId: userId,
                playlistId: playlistId
            };
        } catch (error) {
            logger.error(
                `Error deleting playlist with ID ${playlistId} from user with ID ${userId}: ${error.message}`
            );
        }
    } else {
        throw new Error("User ID and/or playlist ID not provided to the repository layer: deletePlaylist.");
    }
}

// async function tester() {
//     console.log(await deletePlaylist("USER#user5dbd0e3b-6718-46ca-9867-f2df7765fea5", "4g7D82R1VFGHVmdmIgsVvd"));
// }

// tester();

module.exports = { 
    createPlaylist,
    addSongsToPlaylist,
    getPlaylistsByUser,
    getPlaylistbyPlaylistId,
    deletePlaylist 
};
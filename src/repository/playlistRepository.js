const { logger } = require("../util/logger");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-2" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "Heart-Sync";

async function createPlaylist(userId, playlist) {
    if (userId && playlist) {
        const item = {
            PK: `USER#${userId}`,
            SK: `PLAYLIST#${playlist.playlistId}`,
            playlistName: playlist.playlistName,
            description: playlist.description,
            songIds: playlist.songIds,
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

async function getPlaylistsByUser(userId) {
    if (userId) {
        const command = new QueryCommand({
            TableName,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": `USER#${userId}`,
                ":sk": "PLAYLIST#"
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

async function getPlaylist(userId, playlistId) {
    if (userId && playlistId) {
        const command = new GetCommand({
            TableName,
            Key: {
                PK: `USER#${userId}`,
                SK: `PLAYLIST#${playlistId}`
            }
        });

        try {
            const result = await documentClient.send(command);
            return result.Item || null;
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
                PK: `USER#${userId}`,
                SK: `PLAYLIST#${playlistId}`
            }
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

module.exports = { createPlaylist, getPlaylistsByUser, getPlaylist, deletePlaylist };
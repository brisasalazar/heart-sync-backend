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

async function testValues() {
    addSongsToPlaylist("USER#user5dbd0e3b-6718-46ca-9867-f2df7765fea5", "7mdseRlKqVJ0CP2vsW0dyA", [
    "spotify:track:0Z7nGFVCLfixWctgePsRk9",
    "spotify:track:11EX5yhxr9Ihl3IN1asrfK",
    "spotify:track:15DeqWWQB4dcEWzJg15VrN",
    "spotify:track:39lCP5wTDuUfiJXF1Yy9pL",
    "spotify:track:2M38X60UJnupGPbFTkVPNQ",
    "spotify:track:6XXxKsu3RJeN3ZvbMYrgQW",
    "spotify:track:2SpEHTbUuebeLkgs9QB7Ue",
    "spotify:track:32mVHdy0bi1XKgr0ajsBlG",
    "spotify:track:0Wm0oFyJvhTs1GBYhxRRqi",
    "spotify:track:0ZUo4YjG4saFnEJhdWp9Bt",
    "spotify:track:2Fs18NaCDuluPG1DHGw1XG",
    "spotify:track:4w3tQBXhn5345eUXDGBWZG",
    "spotify:track:0Om9WAB5RS09L80DyOfTNa",
    "spotify:track:3GCL1PydwsLodcpv0Ll1ch",
    "spotify:track:3ixMHLAoBQiPbzT2hJDcQj",
    "spotify:track:59kHPbwyyCApYA8RQQEuXm",
    "spotify:track:1vrd6UOGamcKNGnSHJQlSt",
    "spotify:track:16MVSD0mGI4RMQT83Qzm69",
    "spotify:track:0JbSghVDghtFEurrSO8JrC",
    "spotify:track:2ythurkTtSiyfK7GprJoFW",
    "spotify:track:3vpLBt35y9gLu2Xv59PXLg",
    "spotify:track:15jhnquhNS1IZMlM493UBW",
    "spotify:track:3sW3oSbzsfecv9XoUdGs7h",
    "spotify:track:0AQquaENerGps8BQmbPw14",
    "spotify:track:4wFUdSCer8bdQsrp1M90sa",
    "spotify:track:0JIdBrXGSJXS72zjF9ss9u",
    "spotify:track:2QrQCMel6v2JiLxqrg4p2O",
    "spotify:track:0LQtEJt7x0s6knb6RKdRYc",
    "spotify:track:6YffUZJ2R06kyxyK6onezL",
    "spotify:track:5KBi8un0xbYUbeoV7E9XqX",
    "spotify:track:2yLa0QULdQr0qAIvVwN6B5",
    "spotify:track:3DrjZArsPsoqbLzUZZV1Id",
    "spotify:track:6K0CJLVXqbGMeJSmJ4ENKK",
    "spotify:track:6YO3BijD77E9nuvJKzrzCs",
    "spotify:track:2MiXC2LfpsoeUP5RvMGEQ3",
    "spotify:track:73OX8GdpOeGzKC6OvGSbsv",
    "spotify:track:7Fq9RwQxSn3kW85PrDUf0M",
    "spotify:track:4mnOVRRXsaqg9Nb041xR8u",
    "spotify:track:28cnXtME493VX9NOw9cIUh",
    "spotify:track:1YYhDizHx7PnDhAhko6cDS",
    "spotify:track:7an1exwMnfYRcdVQm0yDev",
    "spotify:track:71OvX5NNLrmz7rpq1ANTQn",
    "spotify:track:5yEPktRqvIhko5QFF3aBhQ",
    "spotify:track:4TJUS843fKiqqIzycM74Oy",
    "spotify:track:6leiB1fEsTnVCuPiielde5",
    "spotify:track:3QUJLKo5Xr7ERbEkJumKQb",
    "spotify:track:01XzUsV5FfM3FclWUcENIt",
    "spotify:track:5ZVGvay4xwgXMnQWffNYeU",
    "spotify:track:0okmLlOW6vKrilXDvtRMfg",
    "spotify:track:0LTSNmOLBt25GMjHlxp9OR",
    "spotify:track:2GAIycsMaDVtMtdvxzR2xI",
    "spotify:track:7tFiyTwD0nx5a1eklYtX2J",
    "spotify:track:7ejwtLv28uDXr5q6iIG3rt",
    "spotify:track:57JVGBtBLCfHw2muk5416J",
    "spotify:track:6hfNDGNTJBR029RmV63IoO",
    "spotify:track:064C5ivM2FUsY0ghkyt4YK",
    "spotify:track:54flyrjcdnQdco7300avMJ",
    "spotify:track:2aSFLiDPreOVP6KHiWk4lF",
    "spotify:track:7GqWnsKhMtEW0nzki5o0d8",
    "spotify:track:2041SLpGLdEqFgNyg86So8",
    "spotify:track:25H6P7a94WUr5102lC6TNI",
    "spotify:track:7ccI9cStQbQdystvc6TvxD",
    "spotify:track:5AZGbqiIK5t1jrWSPT7k8X",
    "spotify:track:1vfyi0Du06IjkakfSdXqGm",
    "spotify:track:35ItUJlMtjOQW3SSiTCrrw",
    "spotify:track:3hU637WcAGM5ubSqeaTme5",
    "spotify:track:4RJdwSqHapVcW5DaRtTkv0",
    "spotify:track:24SGws6o7m3TzROMO5Qc0g",
    "spotify:track:4OKf7CcYuw5H2HptkcKxcP",
    "spotify:track:54flyrjcdnQdco7300avMJ",
    "spotify:track:5GQUVjaja81SDqQC6TuFdd",
    "spotify:track:4igIYHF3B5VBxEafHauVo3",
    "spotify:track:7ccI9cStQbQdystvc6TvxD",
    "spotify:track:1HmzAZUvhQLhLo2z3ocpZI",
    "spotify:track:3lUx27TOwV2nAiKwnYYXxe",
    "spotify:track:00QAndVDVfNqNWYdWAhEan",
    "spotify:track:1HmzAZUvhQLhLo2z3ocpZI",
    "spotify:track:4DtB1PJsbl4KAb2rZVNCUL",
    "spotify:track:790YJcgHlN3SaosQCHlWzn",
    "spotify:track:30kwJjJj9JDMKB3CNoBYoI",
    "spotify:track:4OKf7CcYuw5H2HptkcKxcP",
    "spotify:track:1e9Tt3nKBwRbuaU79kN3dn",
    "spotify:track:2mGEqJahn3CSyCG1BTEqMs",
    "spotify:track:7h2yhVxcZOGyQdOwD4Hu8J",
    "spotify:track:4b0mX1GtrQLiUW9jpb6Xcx",
    "spotify:track:0P7YJ9fxIOM0Rq4pZ2qU42",
    "spotify:track:0xzhryP1AoHUazYdJ5rj3B",
    "spotify:track:3AymrUApW5JKKaNrHQhcBG",
    "spotify:track:2Rua8o4ZNjPx3Q7lHYUgml",
    "spotify:track:2OuImA1gcBXJVMrVH9Kn9p",
    "spotify:track:30U2ANWm8iFBRiYX3USS5H",
    "spotify:track:6Re2AwZUVlgBng04BZTauW",
    "spotify:track:0SaopEgTo6O5dJoFXBbulL",
    "spotify:track:6tYYT8zNxkadSCujCdR6Ur",
    "spotify:track:3VYrW02CQhbkYAe4rpG297",
    "spotify:track:30kwJjJj9JDMKB3CNoBYoI",
    "spotify:track:1mnQiO568zXIrUncttTZGp",
    "spotify:track:7pNjsnSTgme34y3uc2qLHI",
    "spotify:track:5PTvZMe9mIL0GrRvPBRu6S"
])
}

//testValues();

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

module.exports = { 
    createPlaylist,
    addSongsToPlaylist,
    getPlaylistsByUser,
    getPlaylist,
    deletePlaylist 
};
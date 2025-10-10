const { getTrackURI, addTracksToPlaylist } = require("./spotifyService.js");
const { getTracksByGenre, getTracksByArtist } = require("./lastFMService.js");
const playlistRepository = require("../repository/playlistRepository.js");
const userService = require("../service/userService.js");
const { logger } = require("../util/logger.js");

const session = require("../session/session");

// const { use } = require("react");

async function populatePlaylist(playlistId, genre, artist, user_id) {
    if (!playlistId) {
        logger.error("No playlistId provided to populatePlaylist in playlistBuilderService.");
        return null;
    }

    if (await validatePopulatePlaylist(playlistId, genre, artist, user_id)) {
        const tracks = [];
        const spotifyURIs = [];

        try {
            // if (!playlistId) return null;

            if (genre) {
                const tracksByGenre = await getTracksByGenre(genre);
                tracks.push(...tracksByGenre);
            }

            if (artist) {
                const tracksByArtist = await getTracksByArtist(artist);
                tracks.push(...tracksByArtist);
            }

            for (let i = 0; i < tracks.length; i++) {
                const spotifyURI = await getTrackURI(tracks[i].artist.name, tracks[i].name);
                if (spotifyURI) spotifyURIs.push(spotifyURI);
            }
            
            const shuffledURIs = shuffleArray(spotifyURIs);

            await addTracksToPlaylist(playlistId, shuffledURIs);

            await playlistRepository.addSongsToPlaylist(user_id, playlistId, shuffledURIs);

            return shuffledURIs;
        } catch (error) {
            logger.error(`Error populating playlist in playlistBuilderService: ${error.message}`);
            return null;
        }
    }
}

async function getPlaylistByPlaylistId(user_id, playlistId) {
    if (user_id && playlistId) {
        const data = await playlistRepository.getPlaylistbyPlaylistId(user_id, playlistId);
        if (data) {
            logger.info(`Playlist found by ID: ${JSON.stringify(data.playlistName)}`);

            let trackInfo = [];

            const chunkedArray = splitArray(data.songIds, 50);

            for (var i = 0; i < chunkedArray.length; i++) {
                let currentTrackInfo = ""
                chunkedArray[i].forEach(function(track) {
                    const substringToFind = "track:";
                    const startIndex = track.indexOf(substringToFind);
                    const splitPoint = startIndex + substringToFind.length;
                    const extractedId = track.slice(splitPoint);
                    currentTrackInfo += extractedId + ",";
                })
                trackInfo.push(currentTrackInfo);
            }

            // for each in trackInfo, make a call to the spotify API,
            // pull the relevant song information into a JSON object
            // push that to a new set
            // replace songIds with that

            const fullSongSet = new Set();

            for (var i = 0; i < trackInfo.length; i++) {
                const songSet = await playlistRepository.getInfoOnTracks(trackInfo[i]);
                songSet.forEach(item => fullSongSet.add(item));
            }

            console.log(fullSongSet);
            delete data.songIds;
            const mySet = new Set(['apple', 'banana', 'orange']);
            data.tracksInfo = Array.from(fullSongSet);

            return data;
        } else {
            logger.info(`No Playlist found by Playlist Id: ${playlistId}`);
            return null;
        }
    } else {
        logger.info(`Invalid Playlist ID`);
        return null;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
      return array;
}



async function validatePopulatePlaylist(playlistId, genre, artist, user_id) {

    const sessionToken = session?.accessToken;

    if (!sessionToken) {
        logger.error("You are not logged into Spotify");
        return null;
    }

    if (!playlistId || !user_id) {
        logger.error("No playlistId or userId provided to populatePlaylist in playlistBuilderService.");
        return null;
    } else if (!genre && !artist) {
        logger.error("No genre or artist information provided");
        return null;
    }


    const requestedPlaylist = await getPlaylistByPlaylistId(user_id, playlistId);
    const currentUser = await userService.getUserById(user_id);

    return (requestedPlaylist && currentUser);
}

function splitArray(arr, k) {
    const result = [];
    for (let i = 0; i < arr.length; i += k) {
        result.push(arr.slice(i, i + k));
    }
    return result;
}

//async function

module.exports = { populatePlaylist, getPlaylistByPlaylistId }
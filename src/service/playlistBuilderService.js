const { getTrackURI, addTracksToPlaylist } = require("./spotifyService.js");
const { getTracksByGenre, getTracksByArtist } = require("./lastFMService.js");
const playlistRepository = require("../repository/playlistRepository.js");
const { logger } = require("../util/logger.js");

async function populatePlaylist(playlistId, genre, artist, user_id) {
    if (!playlistId) {
        logger.error("No playlistId provided to populatePlaylist in playlistBuilderService.");
        return null;
    }

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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
      return array;
}

module.exports = { populatePlaylist }
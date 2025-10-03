const { getTrackURI, addTracksToPlaylist } = require("./spotifyService.js");
const { getTracksByGenre, getTracksByArtist } = require("./lastFMService.js");
const { logger } = require("../util/logger.js");

async function populatePlaylist(playlistId, genre, artist) {
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

        await addTracksToPlaylist(playlistId, spotifyURIs);

        return spotifyURIs;
    } catch (error) {
        logger.error(`Error populating playlist in playlistBuilderService: ${error.message}`);
        return null;
    }
}

module.exports = { populatePlaylist }
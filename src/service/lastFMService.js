const { logger } = require("../util/logger.js");

async function getTracksByGenre(genre) {
    try {
        const queryParams = new URLSearchParams({
            method: "tag.gettoptracks",
            tag: genre,
            api_key: process.env.LASTFM_API_KEY,
            format: "json",
        });
        const url = `${process.env.LASTFM_API_BASE_URL}/?${queryParams}`;

        const data = await fetch(url)
            .then((res) => res.json())
            .then((data) => data);

        return data.tracks.track;
    } catch (error) {
        logger.error(`Error fetching tracks by genre in lastFMService.js: ${error.message}`);
        return null;
    }
}

async function getTracksByArtist(artist) {
    try {
        const queryParams = new URLSearchParams({
            method: "artist.gettoptracks",
            artist: artist,
            api_key: process.env.LASTFM_API_KEY,
            format: "json",
        });
        const url = `${process.env.LASTFM_API_BASE_URL}/?${queryParams}`;

        const data = await fetch(url)
            .then((res) => res.json())
            .then((data) => data);

        return data.toptracks.track;
    } catch (error) {
        logger.error(`Error fetching tracks by artist in lastFMService.js: ${error.message}`);
        return null;
    }
}

module.exports = { getTracksByGenre, getTracksByArtist };

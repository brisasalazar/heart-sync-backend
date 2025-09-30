const { getRandomNumber } = require("../util/math.js");

async function getRandomizedTracksByGenre(genre) {
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
}

async function getRandomizedTracksByArtist(artist) {
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
}

module.exports = { getRandomizedTracksByGenre, getRandomizedTracksByArtist };

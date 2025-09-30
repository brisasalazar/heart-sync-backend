const { getTrackURI, addTracksToPlaylist } = require("./spotifyService.js");
const { getRandomizedTracksByGenre, getRandomizedTracksByArtist } = require("./lastFMService.js");

async function populatePlaylist(playlistId, genre, artist) {
    let tracks = [];
    const spotifyURIs = [];

    if (genre) {
        const tracksByGenre = await getRandomizedTracksByGenre(genre);
        tracks = [...tracks, ...tracksByGenre];
    }

    if (artist) {
        const tracksByArtist = await getRandomizedTracksByArtist(artist);
        tracks = [...tracks, ...tracksByArtist];
    }

    for (let i = 0; i < tracks.length; i++) {
        const spotifyURI = await getTrackURI(tracks[i].artist.name, tracks[i].name);
        if (spotifyURI) spotifyURIs.push(spotifyURI);
    }

    await addTracksToPlaylist(playlistId, spotifyURIs);

    return spotifyURIs;
}

module.exports = { populatePlaylist }
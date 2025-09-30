const axios = require("axios");
const { getAuthHeaders } = require("../util/auth.js");

async function getUser() {
    const response = await axios.get(process.env.API_BASE_URL + "me", { headers: getAuthHeaders() });
    return response.data;
}

async function getTokenInfo(code) {
    const params = new URLSearchParams({
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": process.env.REDIRECT_URI,
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET
    });

    const response = await axios.post(process.env.TOKEN_URL, params.toString(), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    return response.data;
}

async function refreshToken(session) {
    const params = new URLSearchParams({
        "grant_type": "refresh_token",
        "refresh_token": session.refreshToken,
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET
    })

    const response = await axios.post(process.env.TOKEN_URL, params.toString());
    return response.data;
}

async function getPlaylists() {
    const response = await axios.get(process.env.API_BASE_URL + "me/playlists", { headers: getAuthHeaders() })
    return response.data;
}

async function createPlaylist(userId, name, public, collaborative, description) {
    const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
    }

    const body = {
        name,
        public,
        collaborative,
        description
    };

    const response = await axios.post(process.env.API_BASE_URL + `users/${userId}/playlists`, body, { headers });
    return response.data.id;
}

async function getTrackURI(artist, track) {
    const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
    }
    const queryParams = new URLSearchParams({
        q: `track:"${track}" artist:"${artist}"`,
        type: "track,artist",
        market: "US",
        limit: 1,
        offset: 0
    });
    const url = `${process.env.API_BASE_URL}search?${queryParams.toString()}`;

    const response = await axios.get(url, { headers: headers });

    const items = response.data?.tracks?.items ?? [];

    if (items.length === 0) return null;
    return response.data.tracks.items[0].uri;
}

async function addTracksToPlaylist(playlistId, trackURIs) {
    const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
    }
    const url = `${process.env.API_BASE_URL}playlists/${playlistId}/tracks`;

    const response = await axios.post(url, { uris: trackURIs }, { headers });
    return response.data;
}

module.exports = { getUser, getTokenInfo, refreshToken, getPlaylists, createPlaylist, getTrackURI, addTracksToPlaylist }
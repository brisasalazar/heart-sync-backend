const axios = require("axios");
const { getAuthHeaders } = require("../util/auth.js");
const playlistRepository = require("../repository/playlistRepository.js");
const {logger} = require("../util/logger.js");

const session = require("../session/session");

const client_id="process.env.CLIENT_ID";
const redirect_uri="http://34.229.0.93:3001/spotify/callback";
const client_secret="9f376775293c4dccb5b3ff621a4821dc";

async function getUser() {
    try{
        const response = await axios.get(process.env.API_BASE_URL + "me", { headers: getAuthHeaders() });
        return response.data;
    } catch(err){
        logger.error(err);
        return null;
    }
}

async function getTokenInfo(code) {
    try{
        const params = new URLSearchParams({
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": "http://34.229.0.93:3001/spotify/callback",
            "client_id": process.env.CLIENT_ID,
            "client_secret": "9f376775293c4dccb5b3ff621a4821dc"
        });

        const response = await axios.post(process.env.TOKEN_URL, params.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        return response.data;

    } catch (err){
        logger.error(err);
        return null; 
    }
}

async function refreshToken(session) {
    try{
        const params = new URLSearchParams({
            "grant_type": "refresh_token",
            "refresh_token": session.refreshToken,
            "client_id": process.env.CLIENT_ID,
            "client_secret": "9f376775293c4dccb5b3ff621a4821dc"
        })

        const response = await axios.post(process.env.TOKEN_URL, params.toString());
        return response.data;

    } catch(err){
        logger.error(err);
        return null;
    }
}

async function getPlaylists() {
    try{
        const response = await axios.get(process.env.API_BASE_URL + "me/playlists", { headers: getAuthHeaders() })
        return response.data;
    } catch(err){
        logger.error(err);
        return null;
    }
}

async function getSpotifyPlaylistbyPlaylistId(playlistId) {
    try{
        const response = await axios.get(process.env.API_BASE_URL + `playlists/${playlistId}`, { headers: getAuthHeaders() })
        return response.data;
    } catch(err){
        logger.error(err);
        return null;
    }
}

async function createPlaylist(userId, name, isPublic, isCollaborative, description, localUserId) {
    const sessionToken = session?.accessToken;

    if (!sessionToken) {
        logger.error("You are not logged into Spotify");
        return null;
    }
    
    try{
        const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
        }

        const body = {
            name,
            isPublic,
            isCollaborative,
            description
        };


        const response = await axios.post(process.env.API_BASE_URL + `users/${userId}/playlists`, body, { headers });

        const playlist = {
            playlistName: name,
            description,
            playlistId: response.data.id,
        }

        await playlistRepository.createPlaylist(localUserId, playlist);

        return response.data.id;

    } catch(err){
        logger.error(err);
        return null;
    }
    
}

async function getTrackURI(artist, track) {
    try{
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

    } catch(err){
        logger.error(err);
        return null;
    }
}

async function addTracksToPlaylist(playlistId, trackURIs) {
    try{
        const headers = {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
        }
        const url = `${process.env.API_BASE_URL}playlists/${playlistId}/tracks`;

        const response = await axios.post(url, { uris: trackURIs }, { headers });
        return response.data;

    } catch(err){
        logger.error(err);
        return null;
    }
}

module.exports = { getUser, getTokenInfo, refreshToken, getPlaylists, getSpotifyPlaylistbyPlaylistId, createPlaylist, getTrackURI, addTracksToPlaylist }
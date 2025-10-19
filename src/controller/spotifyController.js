require('dotenv').config();

const express = require("express");
const { getUser, getTokenInfo, refreshToken, getPlaylists, getSpotifyPlaylistbyPlaylistId, createPlaylist, getTrackURI, addTracksToPlaylist } = require("../service/spotifyService.js");
let session = require("../session/session.js");

const { authenticateToken, decodeJWT } = require("../util/jwt.js");
const { getPlaylistbyPlaylistId } = require("../repository/playlistRepository.js");

const spotifyController = express.Router();

console.log("CLIENT_ID:", "5ab34e587e6347e293017038e27f5f98");
console.log("REDIRECT_URI:", "http://34.229.0.93:3001/spotify/callback");
console.log("AUTH_URL:", process.env.AUTH_URL);

spotifyController.get("/login", (req, res) => {
    const scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private";

    const params = new URLSearchParams({
        "client_id": "5ab34e587e6347e293017038e27f5f98",
        "response_type": "code",
        "scope": scope,
        "redirect_uri": "http://34.229.0.93:3001/spotify/callback",
        "show_dialog": true
    })

    console.log(params);
    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
    console.log(authUrl);
    res.redirect(authUrl);
})

spotifyController.get("/callback", async (req, res) => {
    const code = req.query.code;

    const tokenInfo = await getTokenInfo(code);

    session.accessToken = tokenInfo["access_token"];
    session.refreshToken = tokenInfo["refresh_token"];
    session.expiresAt = Date.now() + tokenInfo["expires_in"];

    const redirectURL = `http://heartsync-frontend-pipeline.s3-website-us-east-1.amazonaws.com/spotify-success?accessToken=${session.accessToken}`
    res.redirect(redirectURL);
})

spotifyController.get("/playlists", async (req, res) => {
    const playlists = await getPlaylists();
    res.json(playlists);
})

spotifyController.get("/playlists/:playlistId", async (req, res) => {
    const {playlistId} = req.params;
    const playlist = await getSpotifyPlaylistbyPlaylistId(playlistId);
    res.json(playlist);
})

spotifyController.get("/refresh-token", async (req, res) => {
    if (Date.now() > session.expiresAt) {
        const newTokenInfo = await refreshToken(session);

        session.accessToken = newTokenInfo.access_token
        session.expiresAt = Date.now() + newTokenInfo.expires_in

        return res.redirect("/playlists")
    }
})

spotifyController.get("/user", async (req, res) => {
    const user = await getUser();
    res.json(user)
})

spotifyController.post("/playlists/:userId", authenticateToken, async (req, res) => { // change to post later
    const { userId } = req.params;
    let { name, public, collaborative, description } = req.query;

    public = public === "true";
    collaborative = collaborative === "true";

    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);

    const playlist = await createPlaylist(userId, name, public, collaborative, description, localTranslatedToken.id);

    if (playlist) {
        res.status(201).json({message: "User playlist has been created successfully", playlistId: playlist});
    } else {
        res.status(400).json({message: "Failed to create user playlist", data: req.query});
    }
    
    // res.json(playlist)
})

// FOR TESTING
spotifyController.get("/session", (req, res) => {
    res.json(session);
});

module.exports = spotifyController;
const express = require("express");
const { getUser, getTokenInfo, refreshToken, getPlaylists, createPlaylist, getTrackURI, addTracksToPlaylist } = require("../service/spotifyService.js");
let session = require("../session/session.js");

const { authenticateToken, decodeJWT } = require("../util/jwt.js");

const spotifyController = express.Router();

spotifyController.get("/login", (req, res) => {
    const scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private";

    const params = new URLSearchParams({
        "client_id": process.env.CLIENT_ID,
        "response_type": "code",
        "scope": scope,
        "redirect_uri": process.env.REDIRECT_URI,
        "show_dialog": true
    })

    const authUrl = `${process.env.AUTH_URL}?${params.toString()}`
    //console.log(authUrl);
    res.redirect(authUrl);
})

spotifyController.get("/callback", async (req, res) => {
    const code = req.query.code;

    const tokenInfo = await getTokenInfo(code);

    session.accessToken = tokenInfo["access_token"];
    session.refreshToken = tokenInfo["refresh_token"];
    session.expiresAt = Date.now() + tokenInfo["expires_in"];

    const redirectURL = `http://localhost:5173/spotify-success?accessToken=${session.accessToken}`
    res.redirect(redirectURL);
})

spotifyController.get("/playlists", async (req, res) => {
    const playlists = await getPlaylists();
    res.json(playlists);
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
    const trackURI = await getTrackURI("One Direction", "Olivia");
    await addTracksToPlaylist("3Bgvpn0dwhA7kNh6T0P1Og", [trackURI]);

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
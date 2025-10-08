const express = require("express");
const { populatePlaylist } = require("../service/playlistBuilderService.js");
const { authenticateToken, decodeJWT} = require("../util/jwt.js");

const playlistBuilderController = express.Router();

playlistBuilderController.post("/", authenticateToken, async (req, res) => { // change to post later
    const { playlistId, genre, artist,  } = req.query;
    //console.log(playlistId, genre, artist);

    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);


    const spotifyURIs = await populatePlaylist(playlistId, genre, artist, localTranslatedToken.id);
    res.json(spotifyURIs);
});

module.exports = playlistBuilderController;
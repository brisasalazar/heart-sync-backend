const express = require("express");
const { populatePlaylist } = require("../service/playlistBuilderService.js");

const playlistBuilderController = express.Router();

playlistBuilderController.post("/", async (req, res) => { // change to post later
    const { playlistId, genre, artist } = req.query;
    const spotifyURIs = await populatePlaylist(playlistId, genre, artist);
    res.json(spotifyURIs);
});

module.exports = playlistBuilderController;
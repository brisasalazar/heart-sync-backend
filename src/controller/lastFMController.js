const express = require("express");
const { getTracksByGenre, getTracksByArtist } = require("../service/lastFMService");

const lastFMController = express.Router();

lastFMController.get("/genre/:genre", async (req, res) => {
    const { genre } = req.params;

    const songs = await getTracksByGenre(genre);
    res.json(songs);
});

lastFMController.get("/artist/:artist", async (req, res) => {
    const { artist } = req.params;

    const songs = await getTracksByArtist(artist);
    res.json(songs)
});

module.exports = lastFMController;
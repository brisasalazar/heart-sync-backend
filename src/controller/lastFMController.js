const express = require("express");
const { getRandomizedTracksByGenre, getRandomizedTracksByArtist } = require("../service/lastFMService");

const lastFMController = express.Router();

lastFMController.get("/genre/:genre", async (req, res) => {
    const { genre } = req.params;

    const songs = await getRandomizedTracksByGenre(genre);
    res.json(songs);
});

lastFMController.get("/artist/:artist", async (req, res) => {
    const { artist } = req.params;

    const songs = await getRandomizedTracksByArtist(artist);
    res.json(songs)
});

module.exports = lastFMController;
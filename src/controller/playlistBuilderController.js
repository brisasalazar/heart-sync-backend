const express = require("express");
const { populatePlaylist, getPlaylistByPlaylistId } = require("../service/playlistBuilderService.js");
const { authenticateToken, decodeJWT} = require("../util/jwt.js");


const playlistBuilderController = express.Router();

playlistBuilderController.post("/", authenticateToken, async (req, res) => { // change to post later
    const { playlistId, genre, artist,  } = req.query;
    //console.log(playlistId, genre, artist);

    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);


    const data = await populatePlaylist(playlistId, genre, artist, localTranslatedToken.id);
    if (data) {
        res.status(201).json({message: "User playlist has been populated successfully", data: data});
    } else {
        res.status(400).json({message: "Failed to populate user playlist", data: req.query});
    } 
});

playlistBuilderController.get("/:playlistId", authenticateToken, async (req, res) => {
    const {playlistId} = req.params; 

    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);

    const data = await getPlaylistByPlaylistId(localTranslatedToken.id, playlistId);
    if (data){
        res.status(200).json({message: `Playlist retrieved `, data: data});
    } else {
        res.status(400).json({message: "Failed to retrieve playlist", data: req.query});
    } 
})

// possibly add routes for
    // deleting a playlist
    // getting all playlists associated with a user
    // Getting a specific playlist by its Id


module.exports = playlistBuilderController;
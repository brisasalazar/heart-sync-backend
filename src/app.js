// imports 
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {logger, loggerMiddleware} = require('./util/logger');
const {authenticateToken} = require("./util/jwt");

// import the necessary functions from the user controller
const userController = require("./controller/userController");
const postController = require("./controller/postController");
const spotifyController = require("./controller/spotifyController");
const lastFMController = require("./controller/lastFMController");
const playlistBuilderController = require("./controller/playlistBuilderController");

const PORT = 3000;

app.use(bodyParser.json());
app.use(express.json());
app.use(loggerMiddleware);
app.use(express.static("static"));

app.use("/users", userController);
app.use("/posts", postController);
app.use("/spotify", spotifyController);
app.use("/last-fm", lastFMController);
app.use("/playlist-builder", playlistBuilderController);

app.get("/", (req, res) => {
    res.send("Home Page");
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
})


//logic



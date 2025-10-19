
require('dotenv').config();

// imports 
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const { logger, loggerMiddleware } = require('./util/logger');
const { authenticateToken } = require("./util/jwt");

console.log("CLIENT_ID:", process.env.CLIENT_ID);
console.log("REDIRECT_URI:", process.env.REDIRECT_URL);
console.log("AUTH_URL:", process.env.AUTH_URL);
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET);
console.log("TOKEN_URL:", process.env.TOKEN_URL);
console.log("API_BASE_URL:", process.env.API_BASE_URL);
console.log("LASTFM_API_KEY:", process.env.LASTFM_API_KEY);
console.log("LASTFM_SHARED_SECRET:", process.env.LASTFM_SHARED_SECRET);
console.log("LASTFM_API_BASE_URL:", process.env.LASTFM_API_BASE_URL);
// import the necessary functions from the user controller
const userController = require("./controller/userController");
const postController = require("./controller/postController");
const spotifyController = require("./controller/spotifyController");
const lastFMController = require("./controller/lastFMController");
const playlistBuilderController = require("./controller/playlistBuilderController");

app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     //origin:"http://heartsync-frontend-pipeline.s3-website-us-east-1.amazonaws.com",
//     credentials: true,
//   })
// );


const PORT = 3001;

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



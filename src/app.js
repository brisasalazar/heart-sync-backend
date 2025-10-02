// imports 
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {logger, loggerMiddleware} = require('./util/logger');
const {authenticateToken} = require("./util/jwt");

// import the necessary functions from the user controller
const userController = require("./controller/userController");
const postController = require("./postController");

const PORT = 3000;

function loggerMiddleware(req, res, next){
    logger.info(`Incoming ${req.method} : ${req.url}`);
    next();
}

app.use(bodyParser.json());
app.use(express.json());
app.use(loggerMiddleware);
app.use(express.static("static"));

app.use("/users", userController);
app.use("/posts", postController);

app.get("/", (req, res) => {
    res.send("Home Page");
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
})


//logic



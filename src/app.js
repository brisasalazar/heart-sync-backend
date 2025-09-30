// imports 
const express = require("express");
const app = express();
const {logger, loggerMiddleware} = require('./util/logger');
const {authenticateToken} = require("./util/jwt");

// import the necessary functions from the user controller
const userController = require("./controller/userController");

const PORT = 3000;

app.use(express.json());
app.use(loggerMiddleware);
app.use(express.static("static"));

app.use("/users", userController);

app.get("/", (req, res) => {
    res.send("Home Page");
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
})


//logic



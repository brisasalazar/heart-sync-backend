//imports
const express = require("express");
const router = new express.Router();
const jwt = require('jsonwebtoken');
const {logger} = require("../util/logger");

const secretKey = "my-secret-key"

// local imports
const userService = require("../service/userService");

//logic

// User Posting Route
router.post("/", validatePostUser, async (req, res) => {
    const data = await userService.postUser(req.body);

    if (data) {
        res.status(201).json({message: `Created User ${JSON.stringify(data)}`});
    } else {
        res.status(400).json({message: "Employee not created", data: req.body});
    }
});


// User Login Route 
router.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const data = await userService.validateLogin(username, password);

    if (data) {
        const token = jwt.sign(
            {
                id: data.user_id,
                username,
            },
            secretKey,
            {
                expiresIn: "60m"
            }
        );

        res.status(200).json({message: "you have logged in", token});
    } else {
        res.status(401).json({message: "invalid login"});
    };
})

async function validatePostUser(req, res, next) {
    const user = req.body;
    if(user.username && user.password && user.email) {
        next();
    } else {
        res.status(400).json({message: "invalid username, password, or email", data: user});
    }
}

//exports
module.exports = router;
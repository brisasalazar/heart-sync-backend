//imports
const express = require("express");
const router = new express.Router();
const {logger} = require("../util/logger");

// local imports
const userService = require("../service/userService");

//logic
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

//exports
//imports
const express = require("express");
const router = new express.Router();
const jwt = require('jsonwebtoken');
const { logger } = require("../util/logger");

const secretKey = "my-secret-key"

// local imports
const userService = require("../service/userService");
const { authenticateToken, decodeJWT } = require("../util/jwt");

//logic

// User retrieval route
router.get("/profile", authenticateToken, async (req, res) => {
    const currUser = req.user;
    //console.log(currUser);
    const data = await userService.getUserById(currUser.id);
    if (data) {
        res.status(200).json({ message: `Profile for ${currUser.username}`, data: data });
    } else {
        req.status(400).json({ message: `Unable to retrieve profile for ${currUser.username}` })
    }
});

router.get("/profile/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const data = await userService.getUserById(userId);
        if (data) {
            res.status(200).json({ message: `Profile for user ${userId}`, data: data });
        } else {
            res.status(404).json({ message: `User not found` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error retrieving profile` });
    }
});

// User Posting Route
router.post("/", validatePostUser, async (req, res) => {
    const data = await userService.postUser(req.body);

    if (data) {
        res.status(201).json({ message: `Created User ${JSON.stringify(data)}` });
    } else {
        res.status(400).json({ message: "User not created", data: req.body });
    }
});


// User Login Route 
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const data = await userService.validateLogin(username, password);

    if (data) {
        const token = jwt.sign(
            {
                id: data.PK,
                username,
                email: data.email,
            },
            secretKey,
            {
                expiresIn: "60m"
            }
        );

        //console.log(await decodeJWT(token));

        res.status(200).json({ message: "you have logged in", token });
    } else {
        res.status(401).json({ message: "invalid login" });
    };
})

// User Update Route
// My guess is that we can just pass in the field to be updated with a single controller method
// then we can just have specific logic in the DAO to manage the request itself
router.put("/description", validateLoginStatus, async (req, res) => {
    const { description } = req.body;
    // get the values from the token, namely the userID
    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);

    // we have already checked to see if the user is logged in
    // we should check that they are logged in as the specific user they plan to update

    const data = await userService.updateUserDescription(localTranslatedToken.id, description);
    if (data) {
        res.status(201).json({ message: "User description has been updated successfully", data: data });
    } else {
        res.status(400).json({ message: "failed to update user description", data: req.body });
    }
})

router.put("/password", validateLoginStatus, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);

    const data = await userService.updateUserPassword(localTranslatedToken.id, oldPassword, newPassword);
    if (data) {
        res.status(201).json({ message: "User password has been updated successfully", data: data });
    } else {
        res.status(400).json({ message: "failed to update user password", data: req.body });
    }
})

router.put("/username", validateLoginStatus, async (req, res) => {
    const { oldUsername, newUsername } = req.body;

    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);

    const data = await userService.updateUsername(localTranslatedToken.id, oldUsername, newUsername);
    if (data) {
        res.status(201).json({ message: "Username has been updated successfully", data: data });
    } else {
        res.status(400).json({ message: "failed to update username", data: req.body });
    }
})

router.put("/following", validateLoginStatus, async (req, res) => {
    const { followingId } = req.body;

    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);

    const data = await userService.addFollowingUser(localTranslatedToken.id, followingId);
    if (data) {
        res.status(201).json({ message: "User following list has been updated successfully", data: data });
    } else {
        res.status(400).json({ message: "failed to update user following list", data: req.body });
    }
})

// Alternate way to handle "followers" list updating

// router.put("/followers", validateLoginStatus, async (req, res) => {
//     const {followingId} = req.body;

//     const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);

//     const data = await userService.addUserToFollowersList(localTranslatedToken.id, followingId);
//     if (data) {
//         res.status(201).json({message: "Target followers list has been updated successfully", data: data});
//     } else {
//         res.status(400).json({message: "failed to update target followers list", data: req.body});
//     }
// })

router.delete("/", validateLoginStatus, async (req, res) => {
    const { password } = req.body;

    const localTranslatedToken = await decodeJWT(req.headers['authorization'].split(" ")[1]);

    const data = await userService.deleteUser(localTranslatedToken.id, password);
    if (data) {
        data.password = password;
        res.status(201).json({ message: "User has been deleted successfully", data: data });
    } else {
        res.status(400).json({ message: "failed to delete user", data: req.body });
    }
})

async function validateLoginStatus(req, res, next) {

    const currentToken = req.headers['authorization']?.split(" ")[1];

    if (currentToken) {
        const translatedToken = await decodeJWT(currentToken);
        if (!translatedToken) {
            res.status(400).json({ message: "Invalid token" });
        } else {
            // currently no check for user role since we aren't implementing a manager function
            next();
        }
    } else {
        res.status(400).json({ message: "You are not logged in as a user" });
    }
}

async function validatePostUser(req, res, next) {
    const user = req.body;
    if (user.username && user.password && user.email) {
        next();
    } else {
        res.status(400).json({ message: "invalid username, password, or email", data: user });
    }
}

//exports
module.exports = router;
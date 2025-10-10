const userRepository = require("../repository/userRepository");
const bcrypt = require('bcrypt');
const {logger} = require("../util/logger");
const e = require("express");


// logic

async function postUser(user) {
    const saltRounds = 10;

    // validate the user and check if the username is already taken
    if (user && await validateUser(user)) {
        const password = await bcrypt.hash(user.password, saltRounds);

        const data = await userRepository.postUser({
            username: user.username,
            password,
            email: user.email,
            PK: "USER#user" + crypto.randomUUID(),
            SK: "METADATA",
            //following: [''],
            // DynamoDB does not support empty string sets
            // we can initialize users without 'following' and 'follower' arrays, and simply update them when necessary
        })

        if (data) {
            logger.info(`Creating new user: ${JSON.stringify(data)}`);
            return data;
        } else {
            logger.info(`Failed to create new user: ${JSON.stringify(user)}`);
            return null;
        }
    } else {
        logger.info(`Failed to validate user: ${JSON.stringify(user)}`);
        return null;
    }
}

async function updateUserDescription(user_id, newDescription) {
    if (await validateUpdateUserDescription(user_id, newDescription)) {
        //const data = await userRepository.updateUserDescription(user_id, newDescription);
        const data = await userRepository.updateUserFields(user_id, {"description": newDescription});

        if (data) {
            logger.info(`User description has been updated: ${JSON.stringify(data)}`);
            return data;
        } else {
            logger.info(`Failed to update user description: ${JSON.stringify(user_id, newDescription)}`);
            return null;
        }
    } else {
        logger.info(`Failed to validate user or description: ${JSON.stringify(user_id, newDescription)}`);
        return null;
    }
}

async function updateUserPassword(user_id, oldPassword, newPassword) {
    const saltRounds = 10;

    if (await validateUpdateUserPassword(user_id, oldPassword, newPassword)) {
        const data = await userRepository.updateUserFields(user_id, {"password": await bcrypt.hash(newPassword, saltRounds)});
        if (data) {
            logger.info(`User password has been updated: ${JSON.stringify(data)}`);
            return data;
        } else {
            logger.info(`Failed to update user password: ${JSON.stringify(user_id, newPassword)}`);
            return null;
        }
    } else {
        logger.info(`Failed to validate new password change: ${JSON.stringify(user_id, newPassword)}`);
        return null;
    }
}

async function updateUsername(user_id, oldUsername, newUsername) {
    if (await validateUpdateUsername(user_id, oldUsername, newUsername)) {
        const data = await userRepository.updateUserFields(user_id, {"username": newUsername});
        if (data) {
            logger.info(`Username has been updated: ${JSON.stringify(data)}`);
            return data;
        } else {
            logger.info(`Failed to update username: ${JSON.stringify(user_id, newUsername)}`);
            return null;
        }
    } else {
        logger.info(`Failed to validate new username change: ${JSON.stringify(user_id, newUsername)}`);
        return null;
    }
}

async function addFollowingUser(user_id, followingId) {
    if (await validateAddFollowingUser(user_id, followingId)) {
        // check to see if the following list exists
        const currentUser = await getUserById(user_id);
        
        let followingList = currentUser?.following;
        //console.log(followingList);

        if (followingList) {
            followingList.add(followingId);
        } else {
            followingList = new Set([followingId]);
        }

        const data = await userRepository.updateUserFields(user_id, {"following": followingList});
        if (data) {
            logger.info(`User following list has been updated: ${JSON.stringify(data)}`);
            //return data;
        } else {
            logger.info(`Failed to update user following list: ${JSON.stringify(user_id, followingId)}`);
            return null;
        }

        // add yourself to the "followers" list of the user you just followed
        const followedUser = await getUserById(followingId);
        let followersList = followedUser?.followers;

        if (followersList) {
            followersList.add(user_id);
        } else {
            followersList = new Set([user_id]);
        }

        // this currently works but it is very sloppy
        // it might be cumbersome but I will probably have to implement a separate API call for this functionality.
        const followersData = await userRepository.updateUserFields(followingId, {"followers": followersList});
        if (followersData) {
            logger.info(`User followers list has been updated: ${JSON.stringify(followersData)}`)
            return data;
        } else {
            logger.info(`Failed to update user followers list: ${JSON.stringify(user_id, followingId)}`)
            return null;
        }

    } else {
        logger.info(`Failed to validate new following list change: ${JSON.stringify(user_id, followingId)}`);
        return null;
    }
}

// Not in use
// async function addUserToFollowersList(user_id, followingId) {
//     if (await validateAddUserToFollowersList(user_id, followingId)) {
//         const followedUser = await getUserById(followingId);
//         let followersList = followedUser?.followers;

//         if (followersList) {
//             followersList.add(user_id);
//         } else {
//             followersList = new Set([user_id]);
//         }

//         const data = await userRepository.updateUserFields(followingId, {"followers": followersList});
//         if (data) {
//             logger.info(`User followers list has been updated: ${JSON.stringify(data)}`)
//             return data;
//         } else {
//             logger.info(`Failed to update user followers list: ${JSON.stringify(user_id, followingId)}`)
//             return null;
//         }
//     } else {
//         logger.info(`Failed to validate new followers list change: ${JSON.stringify(user_id, followingId)}`);
//         return null;
//     }
// }

async function deleteUser(user_id, password) {
    if (await validateUserDeletion(user_id, password)) {

        const data = await userRepository.deleteUser(user_id);

        if (data) {
            logger.info(`User has been deleted: ${JSON.stringify(data)}`);
            return data;
        } else {
            logger.info(`Failed to delete user: ${JSON.stringify(user_id)}`);
            return null;
        }
        
    } else {
        logger.info(`Failed to delete user: ${JSON.stringify(user_id)}`);
        return null;
    }
}

async function getUserById(user_id) {
    if (user_id) {
        const data = await userRepository.getUserbyUserId(user_id);
        if (data) {
            logger.info(`User found by User Id: ${JSON.stringify(data)}`);
            return data;
        } else {
            logger.info(`No User found by User Id: ${user_id}`);
            return null;
        }
    } else {
        logger.info(`Invalid User ID`);
        return null;
    }
}

async function getUserByUsername(username) {
    if (username) {
        const data = await userRepository.getUserByUsername(username);
        if(data) {
            logger.info(`User found by username: ${JSON.stringify(data)}`);
            return data;
        } else {
            logger.info(`User not found by username: ${username}`);
            return null;
        }
    } else {
        logger.info(`Invalid Username`);
        return null;
    }
}

async function getUserByEmail(email) {
    if (email) {
        const data = await userRepository.getUserByEmail(email);
        if(data) {
            logger.info(`User found by email: ${JSON.stringify(data)}`);
            return data;
        } else {
            logger.info(`User not found by email: ${email}`);
            return null;
        }
    } else {
        logger.info(`Invalid Email`);
        return null;
    }
}

// This is a helper function
async function validateLogin(username, password) {
    if (!username || !password) {
        return null;
    }

    // could alternatively get the user by their ID
    const user = await getUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
        logger.info(`User logged in successfully`);
        return user;
    } else {
        logger.info(`User credentials mismatch`);
        return null;
    }
}

async function validateUser(user) {
    // add a check to get a user by their email
    const usernameCheck = await (getUserByUsername(user.username));
    const emailCheck = await (getUserByEmail(user.email));
    if (user && !usernameCheck && !emailCheck) {
        const usernameResult = user.username.length > 0;
        const passwordResult = user.password.length > 0;

        return (usernameResult && passwordResult && (usernameCheck === null));
    } else if (user && (usernameCheck || emailCheck)) {
        logger.info(`User already exists with that username or email`);
        return false;
    } else {
        logger.info(`Invalid User Object`);
        return false;
    }
}

async function validateUpdateUserDescription(user_id, newDescription) {
    if (!user_id || !newDescription) {
        return null;
    }
    const userCheck = await getUserById(user_id);
    // could potentially cut down the possible description length to 500 characters.
    return (userCheck && newDescription.length > 0)
}

async function validateUpdateUserPassword(user_id, oldPassword, newPassword) {
    if (!user_id || !oldPassword || !newPassword) {
        logger.info(`Invalid Password Update Input`);
        return null;
    } else if (oldPassword == newPassword){
        logger.info(`Cannot replace password with the same password`);
        return null;
    }

    const userCheck = await getUserById(user_id);

    return (userCheck && await bcrypt.compare(oldPassword, userCheck.password) && newPassword.length > 0)
}

async function validateUpdateUsername(user_id, oldUsername, newUsername) {
    if (!user_id || !oldUsername || !newUsername) {
        logger.info(`Invalid Username Update Input`);
        return null;
    } else if (oldUsername == newUsername){
        logger.info(`Cannot replace Username with the same Username`);
        return null;
    }

    const userCheck = await getUserById(user_id);
    const newNameCheck = await getUserByUsername(newUsername);

    return (userCheck && userCheck.username == oldUsername && !newNameCheck);
}

async function validateAddFollowingUser(user_id, followingId) {
    if (!user_id || !followingId || user_id == followingId) {
        logger.info(`Invalid Following List Update Input`);
        return null;
    }
    const userCheck = await getUserById(user_id);
    const followingCheck = await getUserById(followingId);

    if (!userCheck || !followingCheck) {
        logger.info(`Non-existant User`);
        return null;
    }

    let userFollowList = userCheck?.following;

    if (userFollowList && userFollowList.has(followingId)) {
        logger.info(`Following List Already Has New Following ID`);
        return null
    }

    return true;
}

// not in use
async function validateAddUserToFollowersList(user_id, followingId) {
    if (!user_id || !followingId || user_id == followingId) {
        logger.info(`Invalid Followers List Update Input`);
        return null;
    }

    const userCheck = await getUserById(user_id);
    const followingCheck = await getUserById(followingId);

    // Because a set cannot contain duplicates we don't need to check wether or not the 
    // other user's "followers" list contains the user_id

    if (!userCheck || !followingCheck) {
        logger.info(`Non-existant User`);
        return null;
    }

    let targetFollowersList = followingCheck?.followers;
    
    if (targetFollowersList && targetFollowersList.has(user_id)) {
        logger.info(`Followers List already contains User's ID`);
        return null;
    }
    
    return true;
}

async function validateUserDeletion(user_id, password) {
    if (!user_id || !password) {
        return null;
    }
    const userCheck = await getUserById(user_id);

    if (userCheck && (await bcrypt.compare(password, userCheck.password))) {
        logger.info(`User Deletion Validated`)
        return true;
    } else {
        logger.info(`User Deletion Could Not Be Validated`);
        return false;
    }
}

// exports
module.exports = {
    postUser,
    validateLogin,
    getUserByUsername,
    getUserByEmail,
    getUserById,
    updateUserDescription,
    updateUserPassword,
    updateUsername,
    addFollowingUser,
    //addUserToFollowersList,
    deleteUser,
}
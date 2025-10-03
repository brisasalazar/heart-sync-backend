const userRepository = require("../repository/userRepository");
const bcrypt = require('bcrypt');
const {logger} = require("../util/logger");


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
            logger.info(`Failed to update user description: ${JSON.stringify(user_id)}`);
            return null;
        }
    } else {
        logger.info(`Failed to validate user or description: ${JSON.stringify(user_id, newDescription)}`);
        return null;
    }
}

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
    const usernameCheck = await (getUserByUsername(user.username));
    if (user && !usernameCheck) {
        const usernameResult = user.username.length > 0;
        const passwordResult = user.password.length > 0;

        return (usernameResult && passwordResult && (usernameCheck === null));
    } else if (user && usernameCheck) {
        logger.info(`User already exists with that username`);
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
    getUserById,
    updateUserDescription,
    deleteUser,
}
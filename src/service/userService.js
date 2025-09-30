const userRepository = require("../repository/userRepository");
const bcrypt = require('bcrypt');
const {logger} = require("../util/logger");


// logic
async function validateLogin(username, password) {
    if (!username || !password) {
        return null;
    }

    const user = await getUserByUsername(username);
    if (user && (await bycrypt.compare(password, user.password))) {
        logger.info(`User logged in successfully`);
        return employee;
    } else {
        logger.info(`User credentials mismatch`);
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


// exports
module.exports = {
    validateLogin,
    getUserByUsername,
}
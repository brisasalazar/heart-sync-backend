const jwt = require("jsonwebtoken");
const logger = require("./logger");

const secretKey = "my-secret-key";

async function authenticateToken(req, res, next) {
    // to authenticate, there is a specific header called authorization
    // that header value will contain the JSON web token
    // authorization: "Bearer tokenstring"

    const authHeader = req.headers["authorization"];
    //console.log(req.headers);
    //extract the token
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) {
        res.status(400).json({message: "forbidden access"});
    } else{
        const user = await decodeJWT(token);
        if (user) {
            req.user = user; // You generally should not modify the incoming req
            next();
        } else{
            res.status(400).json({message: "Bad JWT"})
        }
    }
}

async function decodeJWT(token) {
    try {
        const user = await jwt.verify(token, secretKey);
        return user;
        //console.log(user);
    } catch(error) {
        // TypeError: logger.error is not a function
        // seems to be some kind of an issue with logger.error
        // doesn't seem to be affecting things though
        //logger.error(error);
        return null;
    }
}

module.exports = {
    authenticateToken,
    decodeJWT,
}
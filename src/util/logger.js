const {createLogger, transports, format} = require("winston");
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
    format: combine(
    label({ label: 'HeartSync Backend' }),
    timestamp(),
    prettyPrint()
    ),
    transports: [
        new (transports.Console)(),
        new (transports.File)({filename: 'loggerFile.log'})
    ]
});

function loggerMiddleware(req, res, next){
    logger.info(`Incoming ${req.method} : ${req.url}`);
    next();
}

module.exports = {
    logger,
    loggerMiddleware
}
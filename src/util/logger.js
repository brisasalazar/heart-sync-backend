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

module.exports = {
    logger
}
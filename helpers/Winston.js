const winston = require("winston");
const { consoleOption, folderOption } = require("./Config");

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(folderOption),
    new winston.transports.Console(consoleOption)
  ],
  exitOnError: false // do not exit on handled exceptions
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;

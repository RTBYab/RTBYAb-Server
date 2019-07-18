const winston = require("../../helpers/Winston");
require("express-async-errors");

process.on("uncaughtException", err => {
  winston.error("uncaughtException", {
    message: err.message,
    stack: err.stack
  }); // logging with MetaData
  process.exit(1); // exit with failure
});

process.on("unhandledRejection", err => {
  winston.error.exceptions.handle(err.message);
  process.exit(1);
});

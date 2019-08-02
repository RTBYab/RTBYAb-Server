const winston = require("../../helpers/Winston");
require("express-async-errors");

process.on("uncaughtException", err => {
  winston.error("uncaughtException", {
    message: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on("unhandledRejection", err => {
  winston.error.exceptions.handle(err.message);
  console.warn("unhandledRejection");
});

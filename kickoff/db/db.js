const dotenv = require("dotenv");
const mongoose = require("mongoose");
const winston = require("../../helpers/Winston");
const Language = require("../../helpers/Language");

dotenv.config();

module.exports = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    .then(() => winston.info(Language.en.DataBaseHasConnected));

  mongoose.connection.on("error", err => {
    winston.error(`uncaughtException: DB connection error => ${err.message}`);
  });
};

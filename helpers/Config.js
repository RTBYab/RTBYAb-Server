const appRoot = require("app-root-path");
const multer = require("multer");
const Language = require("./Language.js");

exports.folderOption = {
  level: "info", // Which level want to winston record !
  filename: `${appRoot}/logs/app.log`,
  handleExceptions: true,
  json: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  colorize: true
};
exports.consoleOption = {
  level: "debug",
  handleExceptions: true,
  json: true,
  colorize: true
};

exports.generalConfig = {
  envirement: "dev"
};

exports.multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: Language.fa.notProppeFileType }, false);
    }
  }
};

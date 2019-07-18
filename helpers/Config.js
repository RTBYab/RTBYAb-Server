const appRoot = require("app-root-path");

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

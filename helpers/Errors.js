const Language = require("./Language");
const winston = require("winston");

// 404 Error
exports._404 = (req, res, next) => {
  res.status(404).json({ error: Language.fa._404 });
  next();
};

// UnAuthorized Error
exports.unAuthorized = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.log("req.id", req.id);
    res.status(401).json({ error: Language.fa.UnAuthorized });
  }
  next();
};

//  internal Server Error
exports.internalError = (err, req, res, next) => {
  if (err.name === "ServerError") winston.error(err.message, err);
  res.status(500).json({ message: Language.fa.InternalErrorMessage });
  next();
};

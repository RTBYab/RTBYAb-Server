const Language = require("./Language");
const winston = require("winston");

exports.catchErrors = fn => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

// 404 Error
exports._404 = (req, res, next) => {
  // const err = new Error(Language.fa.NoStoreFound);
  res.status(404).json({ message: Language.fa.NoStoreFound });
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

//  internal Server Error %00
exports.internalError = (err, req, res, next) => {
  if (err.code === 500) winston.error(err.message, err);
  res.status(500).json({ message: Language.fa.InternalErrorMessage });
  next();
};

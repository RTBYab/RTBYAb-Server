const { unAuthorized, internalError, _404 } = require("../../helpers/Errors");

module.exports = app => {
  app.use(unAuthorized);
  app.use(internalError);
  app.use(_404);
};

const compression = require("compression");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

module.exports = app => {
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(cors());
  app.use(compression());
};

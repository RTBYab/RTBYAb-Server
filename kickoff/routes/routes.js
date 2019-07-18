const expressValidator = require("express-validator");
const bodyParser = require("body-parser");

const systemInfo = require("../../routes/systemReport");
const postRoutes = require("../../routes/post");
const authRoutes = require("../../routes/auth");
const userRoutes = require("../../routes/user");
const doc = require("../../routes/doc");

module.exports = app => {
  app.use(bodyParser.json());
  app.use(expressValidator());
  app.use("/api", postRoutes);
  app.use("/api", authRoutes);
  app.use("/api", userRoutes);
  app.use("/api", systemInfo);
  app.use("/api", doc);
};

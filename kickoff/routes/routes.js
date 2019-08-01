const expressValidator = require("express-validator");
const bodyParser = require("body-parser");

const systemInfo = require("../../routes/api/systemReport");
const storeRoutes = require("../../routes/api/store");
const postRoutes = require("../../routes/api/post");
const authRoutes = require("../../routes/api/auth");
const userRoutes = require("../../routes/api/user");
const doc = require("../../routes/doc");

module.exports = app => {
  app.use(bodyParser.json());
  app.use(expressValidator());
  app.use("/api", postRoutes);
  app.use("/api", authRoutes);
  app.use("/api", userRoutes);
  app.use("/api", storeRoutes);
  app.use("/api", systemInfo);
  app.use("/api", doc);
};

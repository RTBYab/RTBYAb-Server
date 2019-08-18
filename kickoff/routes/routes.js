const systemInfo = require("../../routes/api/systemReport");
const reviewRoutes = require("../../routes/api/review");
const expressValidator = require("express-validator");
const storeRoutes = require("../../routes/api/store");
const postRoutes = require("../../routes/api/post");
const authRoutes = require("../../routes/api/auth");
const userRoutes = require("../../routes/api/user");
const bodyParser = require("body-parser");
const doc = require("../../routes/doc");

module.exports = app => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(expressValidator());

  app.use("/api", reviewRoutes);
  app.use("/api", postRoutes);
  app.use("/api", authRoutes);
  app.use("/api", userRoutes);
  app.use("/api", storeRoutes);
  app.use("/api", systemInfo);
  app.use("/api", doc);
};

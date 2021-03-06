const compression = require("compression");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

module.exports = app => {
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(morgan("dev"));
  app.use(express.static("public"));
};

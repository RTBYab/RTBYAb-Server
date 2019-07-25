const express = require("express");
const router = express.Router();
const { systemInfo } = require("../../controllers/systemReport");

router.get("/getsysteminfo", systemInfo);

module.exports = router;

const express = require("express");
const router = express.Router();
const appRoot = require("app-root-path");
const { readFile } = require("fs");

router.get("/", async (req, res) => {
  // throw new Error("!!!");
  await readFile(`${appRoot}/docs/apiDocs.json`, (err, data) => {
    if (err) return res.status(400).json({ error: err.message });
    const docs = JSON.parse(data);
    res.json(docs);
  });
});
module.exports = router;

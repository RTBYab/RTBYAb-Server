const router = require("express").Router();

const { craeteStore, hasAuthorization } = require("../../controllers/store");
const { requireSignin } = require("../../controllers/auth");
const { powerToAct } = require("../../controllers/user");
const { userById } = require("../../controllers/user");

// createStore
router.post(
  "/store/createstore/:userId",
  requireSignin,
  hasAuthorization,
  // powerToAct,
  craeteStore
);

router.param("userId", userById);

module.exports = router;

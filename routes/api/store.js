const router = require("express").Router();

const {
  craeteStore,
  hasAuthorization,
  updateStore
} = require("../../controllers/store");
const { requireSignin } = require("../../controllers/auth");
const { createStoreValidator } = require("../../helpers/validator");
const { userById } = require("../../controllers/user");

// Create Store
router.post(
  "/store/createstore/:userId",
  requireSignin,
  createStoreValidator,
  hasAuthorization,
  craeteStore
);

// Update Store
router.put(
  "/store/updatestore/:userId",
  requireSignin,
  createStoreValidator,
  hasAuthorization,
  updateStore
);

router.param("userId", userById);

module.exports = router;

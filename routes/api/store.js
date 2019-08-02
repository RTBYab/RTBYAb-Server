const router = require("express").Router();
const { catchErrors } = require("../../helpers/Errors");
const { userById } = require("../../controllers/user");
const { requireSignin } = require("../../controllers/auth");
const { createStoreValidator } = require("../../helpers/validator");

const {
  craeteStore,
  hasAuthorization,
  updateStore,
  singlePhotoUpload,
  resizePhoto
} = require("../../controllers/store");

// Create Store
router.post(
  "/store/createstore/:userId",
  singlePhotoUpload,
  resizePhoto,
  requireSignin,
  // createStoreValidator,
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

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
  resizePhoto,
  getStore,
  getStoreByStoreOwner
} = require("../../controllers/store");

// Create Store
router.post(
  "/store/createstore/:userId",
  singlePhotoUpload,
  catchErrors(resizePhoto),
  requireSignin,
  createStoreValidator,
  hasAuthorization,
  catchErrors(craeteStore)
);

// Update Store
router.put(
  "/store/updatestore/:userId",
  singlePhotoUpload,
  catchErrors(resizePhoto),
  requireSignin,
  createStoreValidator,
  hasAuthorization,
  catchErrors(updateStore)
);

// Get The Store By ID
router.get("/store/:id", catchErrors(getStore));
// Get The Store By ID
router.get("/store/storeOwner/:id", catchErrors(getStoreByStoreOwner));

router.param("userId", userById);

module.exports = router;

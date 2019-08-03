const { createStoreValidator } = require("../../helpers/validator");
const { requireSignin } = require("../../controllers/auth");
const { userById } = require("../../controllers/user");
const { catchErrors } = require("../../helpers/Errors");
const router = require("express").Router();

const {
  craeteStore,
  hasAuthorization,
  updateStore,
  singlePhotoUpload,
  resizePhoto,
  getStore,
  getStoreByStoreOwner,
  reGenerateToken,
  searchStore
} = require("../../controllers/store");

// Create Store
router.post(
  "/store/createstore/:userId",
  requireSignin,
  hasAuthorization,
  singlePhotoUpload,
  catchErrors(resizePhoto),
  createStoreValidator,
  catchErrors(craeteStore),
  reGenerateToken
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

// Search Store
router.get("store/search", catchErrors(searchStore));

// Get The Store By ID
router.get("/store/:id", catchErrors(getStore));
// Get The Store By ID
router.get("/store/storeOwner/:id", catchErrors(getStoreByStoreOwner));

router.param("userId", userById);

module.exports = router;

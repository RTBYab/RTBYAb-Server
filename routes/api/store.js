const { createStoreValidator } = require("../../helpers/validator");
const { requireSignin } = require("../../controllers/auth");
const { catchErrors } = require("../../helpers/Errors");
const { userById } = require("../../controllers/user");
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
  searchStore,
  deleteStore
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
// Get The Store By ID
router.get("/store/:id", catchErrors(getStore));
// Update Store
router.put(
  "/store/updatestore/:userId",
  requireSignin,
  singlePhotoUpload,
  catchErrors(resizePhoto),
  createStoreValidator,
  hasAuthorization,
  catchErrors(updateStore)
);
// Search Store
router.get("/stote/search", catchErrors(searchStore));
// Delete Store
router.delete(
  "/store/:storeId",
  requireSignin,
  hasAuthorization,
  catchErrors(deleteStore)
);

// Get The Store By ID
router.get("/store/storeOwner/:id", catchErrors(getStoreByStoreOwner));

router.param("userId", userById);

module.exports = router;

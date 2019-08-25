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
  deleteStore,
  storeFinder
} = require("../../controllers/store");
const router = require("express").Router();
const { userById } = require("../../controllers/user");
const { catchErrors } = require("../../helpers/Errors");
const { requireSignin } = require("../../controllers/auth");
const { createStoreValidator } = require("../../helpers/validator");

// Create Store
router.post(
  "/store/createstore/:userId",
  requireSignin,
  hasAuthorization,
  singlePhotoUpload,
  catchErrors(resizePhoto),
  // createStoreValidator,
  catchErrors(craeteStore)
  // reGenerateToken
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
router.get("/search", catchErrors(searchStore));
router.get("/finder", catchErrors(storeFinder));

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

const {
  getStore,
  craeteStore,
  updateStore,
  resizePhoto,
  searchStore,
  deleteStore,
  storeFinder,
  storeByOwner,
  deleteComment,
  createComment,
  hasAuthorization,
  updateStorePhoto,
  singlePhotoUpload,
  updateStoreDetails,
  powerToUpdateStore,
  getStoreProfilePhoto,
  getStoreByStoreOwner
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
  // createStoreValidator,
  catchErrors(craeteStore)
);
// Get The Store By ID
router.get("/store/:id", catchErrors(getStore));

// Create Comment
router.post(
  "/store/createcomment/:id/:userId",
  requireSignin,
  catchErrors(createComment)
);

// Delete Comment
router.delete(
  "/store/deleteComment/:storeId/:commentId",
  requireSignin,
  // hasAuthorization,
  catchErrors(deleteComment)
);

// Update Store Address
router.put(
  "/store/updatestore/:storeId",
  requireSignin,
  // createStoreValidator,
  powerToUpdateStore,
  catchErrors(updateStore)
);

// Upload & Update Store Photo
router.post(
  "/store/updatephoto/:storeId",
  requireSignin,
  powerToUpdateStore,
  singlePhotoUpload,
  catchErrors(resizePhoto),
  catchErrors(updateStorePhoto)
);
// Update Store Dtails
router.put(
  "/store/updatedetails/:storeId",
  requireSignin,
  powerToUpdateStore,
  catchErrors(updateStoreDetails)
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

// Get Store Profile Store Photo
router.get(
  "/store/storeprofilePhoto/:id/:imageId",
  catchErrors(getStoreProfilePhoto)
);

// Get The Store By ID
router.get("/store/storeOwner/:id", catchErrors(getStoreByStoreOwner));

router.param("storeId", storeByOwner);
router.param("userId", userById);

module.exports = router;

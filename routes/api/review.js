const {
  writeReview,
  updateReview,
  deleteReview,
  getStoreReview,
  hasAuthorization
} = require("../../controllers/review");
const { requireSignin } = require("../../controllers/auth");
const { catchErrors } = require("../../helpers/Errors");
const { userById } = require("../../controllers/user");
const router = require("express").Router();

// Get Review by StoreID :)
router.get("/review/:storeId", catchErrors(getStoreReview));

// Write a Review
router.post(
  "/review/:userId/:storeId",
  requireSignin,
  catchErrors(writeReview)
);

// Update Review
router.put(
  "/review/:userId/:storeId",
  requireSignin,
  hasAuthorization,
  catchErrors(updateReview)
);

// Delete Review
router.delete(
  "/review/:userId/:reviewId",
  requireSignin,
  hasAuthorization,
  catchErrors(deleteReview)
);

router.param("userId", userById);

module.exports = router;

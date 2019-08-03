const Review = require("../models/Review");
const Language = require("../helpers/Language");

// Write Review
exports.writeReview = async (req, res) => {
  req.body.author = req.auth._id;
  req.body.store = req.params.storeId;
  const review = await Review(req.body);
  await review.save();
  res.json(review);
};

// Update Review
exports.updateReview = async (req, res) => {
  req.body.author = req.auth._id;
  req.body.store = req.params.storeId;
  id = req.body.id;
  text = req.body.text;
  const review = await Review.findByIdAndUpdate(
    id,
    { $set: { text } },
    { new: true }
  );
  if (!review)
    return res.status(404).json({ message: Language.fa.NoReviewFound });
  res.json(review);
};

// Get Store's Review By Id :)
exports.getStoreReview = async (req, res) => {
  const review = await Review.find({ store: req.params.storeId });
  if (!review)
    return res.status(404).json({ message: Language.fa.NoReviewFound });
  res.json(review);
};

// Delete Review
exports.deleteReview = async (req, res) => {
  const review = await Review.findByIdAndRemove(req.params.reviewId);
  if (!review)
    return res.status(404).json({ message: Language.fa.NoReviewFound });
  res.json(review);
  // res.json(req.params);
};

exports.hasAuthorization = (req, res, next) => {
  let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
  let adminUser = req.profile && req.auth && req.auth.role === "admin";
  let managerUser = req.profile && req.auth && req.auth.role === "manager";

  const authorized = sameUser || adminUser || managerUser;

  console.log(
    "SAMEUSER",
    sameUser,
    "ADMINUSER",
    adminUser,
    "MANAGERUSER",
    managerUser
  );
  if (!authorized)
    return res.status(403).json({ error: Language.fa.UnAuthorized });
  next();
};

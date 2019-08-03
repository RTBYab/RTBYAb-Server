const { singlePhotoUpload, resizePhoto } = require("../../controllers/store");
const { createPostValidator } = require("../../helpers/validator");
const { requireSignin } = require("../../controllers/auth");
const { catchErrors } = require("../../helpers/Errors");
const { userById } = require("../../controllers/user");
const express = require("express");
const router = express.Router();

const {
  getPosts,
  createPost,
  postsByUser,
  postById,
  isPoster,
  updatePost,
  deletePost,
  photo,
  singlePost,
  like,
  unlike,
  comment,
  userRole,
  hasAuthorization,
  powerToAct,
  updateComment
  // findPosts
} = require("../../controllers/post.js");

// Post Router has Begun :)

router.get("/posts", getPosts);

// like unlike
router.put("/post/like/:userId", requireSignin, powerToAct, like);
router.put("/post/unlike/:userId", requireSignin, powerToAct, unlike);

// comments
router.post("/post/comment/:userId", requireSignin, powerToAct, comment);
// router.put("/post/uncomment/:userId", requireSignin, powerToAct, uncomment);

router.put("/post/updatecomment/:id", requireSignin, updateComment);

// Craete Post
router.post(
  "/post/new/:userId",
  requireSignin,
  userRole,
  // hasAuthorization,
  singlePhotoUpload,
  catchErrors(resizePhoto),
  createPostValidator,
  createPost
);

router.get("/posts/by/:userId", requireSignin, postsByUser);
router.get("/post/:postId", singlePost);
router.put("/post/:postId", requireSignin, isPoster, updatePost);
router.delete("/post/:postId", requireSignin, isPoster, deletePost);
// photo
router.get("/post/photo/:postId", photo);

// any route containing :userId, our app will first execute userById()
router.param("userId", userById);
// any route containing :postId, our app will first execute postById()
router.param("postId", postById);

module.exports = router;

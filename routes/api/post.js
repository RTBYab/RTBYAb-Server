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
  uncomment,
  hasAuthorization,
  powerToAct,
  updateComment
  // findPosts
} = require("../../controllers/post.js");
const { requireSignin } = require("../../controllers/auth");
const { userById } = require("../../controllers/user");
const { createPostValidator } = require("../../helpers/validator");

router.get("/posts", getPosts);

// like unlike
router.put("/post/like/:userId", requireSignin, powerToAct, like);
router.put("/post/unlike/:userId", requireSignin, powerToAct, unlike);

// comments
router.post("/post/comment/:userId", requireSignin, powerToAct, comment);
// router.put("/post/uncomment/:userId", requireSignin, powerToAct, uncomment);

router.put("/post/updatecomment/:id", requireSignin, updateComment);

// post routes
router.post(
  "/post/new/:userId",
  requireSignin,
  hasAuthorization,
  createPost,
  powerToAct,
  createPostValidator
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

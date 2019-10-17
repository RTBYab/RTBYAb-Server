const {
  like,
  photo,
  unlike,
  comment,
  getPosts,
  postById,
  isPoster,
  updatePost,
  deletePost,
  userRole,
  createPost,
  powerToAct,
  singlePost,
  postsByUser,
  updateComment,
  getStorePosts
  // findPosts
} = require("../../controllers/post.js");
const {
  singlePhotoUpload,
  postResizePhoto
} = require("../../controllers/store");
const { createPostValidator } = require("../../helpers/validator");
const { requireSignin } = require("../../controllers/auth");
const { catchErrors } = require("../../helpers/Errors");
const { userById } = require("../../controllers/user");
const express = require("express");
const router = express.Router();

// Post Router has Begun :)

router.get("/posts", getPosts);

router.get("/posts/:id", catchErrors(getStorePosts));

// Like/Unlike
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
  catchErrors(postResizePhoto),
  // createPostValidator,
  createPost
);

router.get("/posts/by/:userId", requireSignin, postsByUser);
router.get("/post/:postId", singlePost);
router.put(
  "/post/:postId",
  requireSignin,
  isPoster,
  singlePhotoUpload,
  catchErrors(postResizePhoto),
  updatePost
);

// Delete Post
router.delete("/posts/:postId", requireSignin, isPoster, deletePost);

// photo
router.get("/post/photo/:postId", photo);

// any route containing :userId, our app will first execute userById()
router.param("userId", userById);
// any route containing :postId, our app will first execute postById()
router.param("postId", postById);

module.exports = router;

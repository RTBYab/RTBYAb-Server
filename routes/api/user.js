const express = require("express");
const router = express.Router();

const {
  userById,
  allUsers,
  getUser,
  updateUser,
  deleteUser,
  userPhoto,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  findPeople,
  hasAuthorization,
  report,
  getScore,
  scoreIncreasment,
  powerToAct
} = require("../../controllers/user");
const { requireSignin } = require("../../controllers/auth");

// Following/Follower
router.put(
  "/user/follow",
  requireSignin,
  powerToAct,
  addFollowing,
  addFollower
);
router.put(
  "/user/unfollow",
  requireSignin,
  powerToAct,
  removeFollowing,
  removeFollower
);

router.get("/users", allUsers);
// Get UserBY Id
router.get("/user/:userId", requireSignin, getUser);
// Update User
router.put("/user/:userId", requireSignin, hasAuthorization, updateUser);
// Delete User
router.delete("/user/:userId", requireSignin, hasAuthorization, deleteUser);
// photo
router.get("/user/photo/:userId", userPhoto);

// who to follow
router.get("/user/findpeople/:userId", requireSignin, findPeople);

// Report
router.post("/user/report/:userId", requireSignin, powerToAct, report);

// Score
router.get("/users/getscore/", getScore);

// Refferal poin gathering ignIn required :)
router.post("/user/referral/:userId", scoreIncreasment);

// any route containing :userId, our app will first execute userByID()
router.param("userId", userById);

module.exports = router;

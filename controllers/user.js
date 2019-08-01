const _ = require("lodash");
const User = require("../models/user");
const formidable = require("formidable");
const fs = require("fs");
const Language = require("../helpers/Language");

// @route    Middleware
// @desc     get user by Id
// @access   Private
exports.userById = async (req, res, next, id) => {
  await User.findById(id)
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: Language.fa.UserNotFound
        });
      }
      req.profile = user; // adds profile object in req with user info
      user.hashed_password = undefined;
      next();
    });
};

// @route    get api/allusers
// @desc     get all users
// @access   Public
exports.allUsers = async (req, res) => {
  const users = await User.find().select("name -_id");
  if (!users) res.status(404).json({ message: Language.fa.UserNotFound });
  res.json(users);
};

// @route    get api/user/:userId
// @desc     get user by Id
// @access   Private
exports.getUser = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

// @route    post api/user/:userId
// @desc     Update user profile
// @access   Private
exports.updateUser = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: Language.fa.Photo
      });
    }

    let user = req.profile;
    user = _.extend(user, fields);
    user.updated = Date.now();

    if (files.photo) {
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
    }

    user.save((err, result) => {
      if (err)
        return res.status(400).json({
          error: err
        });

      user.hashed_password = undefined;
      user.salt = undefined;
      res.json({ user });
    });
  });
};

exports.userPhoto = (req, res, next) => {
  if (req.profile.photo.data) {
    res.set(("Content-Type", req.profile.photo.contentType));
    return res.send(req.profile.photo.data);
  }
  next();
};

// @route    delete api/user/:userId
// @desc     get user by Id
// @access   Private
exports.deleteUser = async (req, res) => {
  let user = req.profile;
  const result = await user.remove();
  if (!result) res.status(404).json({ message: Language.fa.UserNotFound });
  res.json({ message: Language.fa.UserDeleted });
};

// @route    put api/user/:userId
// @desc     add folloing
// @access   Private
exports.addFollowing = async (req, res, next) => {
  const { followId, userId } = req.body;

  const user = await User.findByIdAndUpdate(userId, {
    $push: { following: followId }
  });
  if (!user) return res.status(404).json({ message: Language.fa.UserNotFound });
  next();
};

// @route    put api/user/follower
// @desc     add follower
// @access   Private
exports.addFollower = async (req, res) => {
  const { followId, userId } = req.body;

  const user = await User.findByIdAndUpdate(
    followId,
    { $push: { followers: userId } },
    { new: true }
  )
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .select("name");
  if (!user) return res.status(404).json({ message: Language.fa.UserNotFound });

  res.json(user);
};

// @route    middleware
// @desc      unfolloing
// @access   Private
exports.removeFollowing = async (req, res, next) => {
  const { userId, unfollowId } = req.body;
  const user = await User.findByIdAndUpdate(userId, {
    $pull: { following: unfollowId }
  });
  if (!user) return res.status(404).json({ message: Language.fa.UserNotFound });
  next();
};

// @route    put api/user/unfollow
// @desc      unfollowing
// @access   Private
exports.removeFollower = async (req, res) => {
  const { unfollowId, userId } = req.body;

  const user = await User.findByIdAndUpdate(
    unfollowId,
    { $pull: { followers: userId } },
    { new: true }
  )
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .select("name");
  if (!user) return res.status(404).json({ message: Language.fa.UserNotFound });

  res.json(user);
};

// @route    get api/user/:userId
// @desc      find people to follow
// @access   Private
exports.findPeople = async (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  const user = await User.find({ _id: { $nin: following } }).select("name");
  if (!user) return res.status(404).json({ message: Language.fa.UserNotFound });
  res.json(user);
};

// @route    post api/user/report/:userId
// @desc      reporting the user User which logged in can report req.body.userId(reporting)
// @access   Private
exports.report = async (req, res) => {
  const report = req.params.userId;
  const reporting = req.body.userId;

  const reportedUser = await User.findByIdAndUpdate(
    reporting,
    {
      $addToSet: { report }
    },
    { new: true }
  )
    .select("name")
    .populate("report", "_id name ")
    .select("report");

  if (!reportedUser)
    return res.status(404).json({ message: Language.fa.UserNotFound });
  res.json(reportedUser);
};

// @route    get api/score/:userId
// @desc     get User Score
// @access   Private
exports.getScore = async (req, res) => {
  const score = await User.find()
    .select("score")

    .sort({ score: -1 });
  if (!score) res.status(404).json({ message: Language.fa.UserNotFound });
  res.json(score);
};

// @route    get api/user/:userId
// @desc     referral code will increse the user score
// @access   Private
exports.scoreIncreasment = async (req, res) => {
  const userId = req.body.userId;
  const referral = req.params.userId;

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { referral }, $inc: { score: 10 } },
    { new: true }
  );

  if (!user) return res.status(404).json({ message: Language.fa.UserNotFound });
  res.json({ message: Language.fa.ReferalMessage });
};

// Has Authorization
exports.hasAuthorization = (req, res, next) => {
  let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
  let adminUser = req.profile && req.auth && req.auth.role === "admin";

  const authorized = sameUser || adminUser;

  // console.log("req.profile ", req.profile, " req.auth ", req.auth);
  console.log("SAMEUSER", sameUser, "ADMINUSER", adminUser);

  if (!authorized)
    return res.status(403).json({ error: Language.fa.UnAuthorized });
  next();
};

// Power To Act
exports.powerToAct = (req, res, next) => {
  const validUser = req.auth._id;
  const id = req.params.userId;
  console.log("req.auth._id", req.auth._id);
  console.log("req.profile", req.profile);
  const powerToAct = validUser == id;

  if (!powerToAct)
    return res.status(403).json({ message: Language.fa.UnAuthorized });
  next();
};

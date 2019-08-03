const Post = require("../models/post");
const User = require("../models/user");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");
const Language = require("../helpers/Language");
const cons = require("../helpers/Constants");


exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name role")
    .populate("likesBy", "_id name ")
    .select("_id title body created likes comments photo")
    .exec((err, post) => {
      if (err || !post)
        return res.status(404).json({ error: Language.fa.NoPostFound });
      req.post = post;
      next();
    });
};

// with pagination
exports.getPosts = async (req, res) => {
  // get current page from req.query or use default value of 1
  const currentPage = req.query.page || 1;
  // return 3 posts per page
  const perPage = 6;
  let totalItems;

  await Post.find()
    // countDocuments() gives you total count of posts
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .populate("comments", "text created")
        .populate("comments.postedBy", "_id name")
        .populate("likes.likesdBy", "_id name")
        .populate("postedBy", "_id name")
        .select("_id title body created likes")
        .limit(perPage)
        .sort({ created: -1 });
    })
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => console.log(err));
};

exports.createPost = async (req, res, next) => {
  const post = await new Post(req.body);
  post.save();
  res.json(post);
};

exports.postsByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate("postedBy", "_id name ")
    .select("_id title body created likes")
    .sort("_created")
    .exec((err, posts) => {
      if (err) return res.status(400).json({ error: err });

      if (posts.length === 0) return res.json({ message: Language.fa.NoPost });
      res.json(posts);
    });
};

exports.isPoster = (req, res, next) => {
  let sameUser = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  let adminUser = req.post && req.auth && req.auth.role === "admin";
  console.log("req.post", req.post);
  console.log("req.post ", req.post, " req.auth ", req.auth);
  console.log("SAMEUSER: ", sameUser, " ADMINUSER: ", adminUser);

  let isPoster = sameUser || adminUser;

  if (!isPoster)
    return res.status(403).json({ error: "User is not authorized" });

  next();
};

exports.updatePost = async (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err)
      return res.status(400).json({ error: "Photo could not be uploaded" });

    // save post
    let post = req.post;
    post = _.extend(post, fields);
    post.updated = Date.now();

    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }

    const result = post.save();
    if (!result) return res.status(500).json({ message: "Error!!!" });
    res.json(post);
  });
};

exports.deletePost = async (req, res) => {
  let post = req.post;
  await post.remove((err, post) => {
    if (!post)
      return res.status(404).json({ message: Language.fa.NoPostFound });
    if (err) return res.status(400).json({ error: err.message });
    res.json({
      message: "Post deleted successfully"
    });
  });
};

exports.photo = (req, res, next) => {
  res.set("Content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

exports.singlePost = (req, res) => {
  return res.json(req.post);
};

exports.like = async (req, res) => {
  const id = req.params.userId;
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    { $addToSet: { likes: id } },
    { new: true }
  );
  if (!post) res.status(404).json({ message: Language.fa.NoPostFound });
  res.json(result);
};

exports.unlike = async (req, res) => {
  const id = req.params.userId;
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: id } },
    { new: true }
  );
  if (!post) res.status(404).json({ message: Language.fa.NoPostFound });
  res.json(post);
};

exports.comment = async (req, res) => {
  const comment = req.body.comment;
  const user = req.params.userId;
  const _id = req.body.postId;
  await Post.findByIdAndUpdate(
    _id,
    { $push: { comments: { text: comment, type: "Text", commentedBy: user } } },
    { new: true }
  )
    .populate("user", "_id name")
    .populate("postedBy", "_id name")
    .exec(err => {
      if (err) return res.status(400).json({ error: err });

      let userScore = User.findByIdAndUpdate(user, {
        $inc: { score: cons.const.commentPoints }
      });
      if (!userScore)
        return res.status(404).json({ message: Language.fa.UserNotFound });
      res.json({ message: Language.fa.CommentPostedSuccessfully });
    });
};

exports.hasAuthorization = (req, res, next) => {
  let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
  let adminUser = req.profile && req.auth && req.auth.role === "admin";

  const authorized = sameUser || adminUser;

  console.log("SAMEUSER", sameUser, "ADMINUSER", adminUser);

  if (!authorized)
    return res.status(403).json({ error: Language.fa.UnAuthorized });
  next();
};

// User Role
exports.userRole = (req, res, next) => {
  let user = req.auth;
  if (user.role !== ("storeOwner" || "admin" || "manager"))
    return res.json({ message: Language.fa.CreateStoreBeforeMakeAPost });
  next();
};

exports.findComments = (req, res) => {
  id = req.params.id;
  Post.comments.findById(id).then();
};

// Update Comment
exports.updateComment = async (req, res) => {
  const commentId = req.body.id;
  const comment = req.body.comment;
  const postId = req.params.id;

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: Language.fa.NoPostFound });

  const com = post.comments.map(comment => comment.id).indexOf(commentId);
  const singleComment = post.comments.splice(com, 1);
  let authorized = singleComment[0].commentedBy;
  console.log("Security Check Passed ?", req.auth._id == authorized);

  if (authorized != req.auth._id)
    return res.status(401).json({ mesage: Language.fa.UnAuthorized });

  const updatedComment = await Post.updateOne(
    { comments: { $elemMatch: { _id: commentId } } },
    { $set: { "comments.$.text": comment } }
  );
  if (!updatedComment)
    return res.status(404).json({ message: Language.fa.NoPostFound });

  res.json({ message: Language.fa.CommentUpdated });
};

// Power To Act
exports.powerToAct = (req, res, next) => {
  const validUser = req.auth._id;
  const id = req.params.userId;

  const powerToAct = validUser == id;

  if (!powerToAct)
    return res.status(403).json({ message: Language.fa.UnAuthorized });
  next();
};

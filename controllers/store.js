require("dotenv").config();
const uuid = require("uuid");
const jimp = require("jimp");
const multer = require("multer");
const User = require("../models/user");
const Store = require("../models/Store");
const Language = require("../helpers/Language");
const { multerOptions } = require("../helpers/Config");

//Single Photo Upload Handler
exports.singlePhotoUpload = multer(multerOptions).single("photo");

// Photo Resizing
exports.resizePhoto = async (req, res, next) => {
  if (!req.file) return next();
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await jimp.HORIZONTAL_ALIGN_CENTER;
  await photo.resize(500, jimp.AUTO);
  await photo.quality(30);
  await photo.write(
    `./public/uploads/storeMainImage/${req.auth._id}/${req.body.photo}`
  );
  next();
};

exports.likeComment = async (req, res) => {
  const user = req.auth._id;
  const idstore = req.params.id;
  const commentId = req.body.commentId;

  const store = await Store.findById(idstore);
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });

  const comment = store.comments.map(com => com.id).indexOf(commentId);
  // const singleComment = store.comments.splice(comment, 1);
  const updateComment = await Store.updateOne(
    {
      comments: { $elemMatch: { _id: commentId } }
    },
    { $addToSet: { "comments.$.likedBy": user } },
    { new: true }
  );
  console.log(comment, updateComment, user);

  if (!updateComment)
    return res.status(404).json({ message: Language.fa.NoCommentFound });

  res.json(store.comments);
};

exports.unLikeComment = async (req, res) => {
  const user = req.auth._id;
  const idstore = req.params.id;
  const commentId = req.body.commentId;

  const store = await Store.findById(idstore);
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });

  const comment = store.comments.map(com => com.id).indexOf(commentId);
  // const singleComment = store.comments.splice(comment, 1);
  const updateComment = await Store.updateOne(
    {
      comments: { $elemMatch: { _id: commentId } }
    },
    { $pull: { "comments.$.likedBy": user } },
    { new: true }
  );
  console.log(comment, updateComment, user);

  if (!updateComment)
    return res.status(404).json({ message: Language.fa.NoCommentFound });

  res.json(store.comments);
};

// for preventing multipart import
// Post Single photo upload handler
exports.postResizePhoto = async (req, res, next) => {
  if (!req.file) return next();
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await jimp.HORIZONTAL_ALIGN_CENTER;
  await photo.resize(500, jimp.AUTO);
  await photo.quality(30);
  await photo.write(
    `./public/uploads/postImages/${req.auth._id}/${req.body.photo}`
  );
  next();
};

// Upload and Update Store Photo
exports.updateStorePhoto = async (req, res) => {
  id = req.params.storeId;
  const store = await Store.findByIdAndUpdate(
    id,
    {
      $set: { photo: req.body.photo }
    },
    { new: true }
  );
  if (!store) return res.status(404).json({ message: Language.NoStoreFound });
  res.json(store);
};

// Create Store
exports.craeteStore = async (req, res) => {
  const id = req.params.userId;

  const storeExists = await Store.findOne({ storeOwner: id });
  if (storeExists)
    return res.status(403).json({ error: Language.fa.StorecraetedBefore });

  const store = await new Store(req.body);
  store.storeOwner = req.profile;

  await User.findByIdAndUpdate(
    id,
    {
      $set: { role: "storeOwner" }
    },
    {
      new: true
    }
  );

  store.save();
  res.json({ message: Language.fa.StoreHasCreated });
};

// Create Comment
exports.createComment = async (req, res) => {
  const id = req.params.id;
  const rate = req.body.rate;
  const comment = req.body.comment;
  const commentedBy = req.auth._id;
  const commentOwner = req.auth.name;

  const store = await Store.findByIdAndUpdate(
    id,
    {
      $push: {
        comments: {
          rate,
          commentedBy,
          commentOwner,
          type: "Text",
          text: comment
        }
      }
    },
    { new: true }
  )
    .populate("user", "_id name")
    .populate("postedBy", "_id name");

  if (!store) res.status(404).json({ message: Language.fa.NoStoreFound });
  res.json(store.comments);
};

// Delete Comment
// exports.deleteComment = async(req,res) => {
//   const id
// }

// Get Specific Comment
exports.deleteComment = async (req, res) => {
  const sId = req.params.storeId;
  const cId = req.params.commentId;

  const store = await Store.findById(sId);
  if (!store) return res.json(404).json({ message: Language.fa.NoStoreFound });

  // Pull out the comment
  const comment = await store.comments.find(
    comment => comment.id === req.params.commentId
    // console.log(req.auth._id === comment.id, "ooo")
  );
  console.log(req.auth);

  if (!comment)
    return res.status(404).json({ message: Language.fa.NoCommentFound });

  const removeIndex = await store.comments
    .map(comment => comment.id)
    .indexOf(cId);

  const singleComment = store.comments.splice(removeIndex, 1);
  let authorized = singleComment[0].commentedBy;
  console.log(
    "Security Check Passed ?",
    req.auth._id == authorized,
    "req.auth._id",
    req.auth._id,
    "commentId",
    authorized
  );

  if (authorized != req.auth._id)
    return res.status(401).json({ mesage: Language.fa.UnAuthorized });

  await store.comments.splice(removeIndex, 0);
  await store.save();
  res.json(comment);
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

// Update Store
exports.updateStore = async (req, res) => {
  const id = req.params.storeId;
  const body = req.body;

  const store = await Store.findByIdAndUpdate(
    id,
    { $set: body },
    {
      new: true
      // runValidators: true
    }
  );
  if (!store) return res.status(404).json({ message: "eeee" });
  res.json(store);
};
// Get Store By Id
exports.findStore = async (req, res) => {
  const store = await Store.findById(id);
  if (!store) return res.json({ message: Language.fa.NoStoreFound });
  res.json(store);
};

exports.updateStoreDetails = async (req, res) => {
  id = req.params.storeId;
  name = req.body.name;
  description = req.body.description;

  const store = await Store.findByIdAndUpdate(
    id,
    {
      $set: { name, description }
    },
    { new: true }
  );
  if (!store) return res.status(404).json({ message: Language.NoStoreFound });
  res.json(store);
};

// HasAuth to Act
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

// Has Power to Update Securely update Store :)
exports.powerToUpdateStore = (req, res, next) => {
  let storeOwner = req.store.storeOwner == req.auth._id;

  console.log("STOREOWNER", storeOwner);
  const authorized = storeOwner;

  if (!authorized)
    return res.status(403).json({ error: Language.fa.UnAuthorized });
  next();
};

// Get Store ById
exports.getStore = async (req, res) => {
  const id = req.params.id;
  const store = await Store.findById(id)
    .select("-__v -slug")
    .populate("author review");
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });
  return res.json(store);
};

// Get Store By Owner in mobile Store Section(Front_End Section)
exports.getStoreByStoreOwner = async (req, res) => {
  const id = req.params.id;
  const store = await Store.findOne({ storeOwner: id }).select("-__v -slug");
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });
  return res.json(store);
};

exports.storeByOwner = async (req, res, next, id) => {
  const store = await Store.findById(id).exec((err, store) => {
    if (err || !store) {
      return res.status(400).json({
        error: Language.fa.UserNotFound
      });
    }
    req.store = store; // adds store object in req with store info
    next();
  });
};

//searchStore
// exports.searchStore = async (req, res) => {
//   const coordinates = [req.body.lng, req.body.lat].map(parseFloat);

//   const store = await Store.find(
//     {
//       $text: {
//         $search: req.body.query
//       }
//     },
//     {
//       score: { $meta: "textScore" }
//     },
//     {
//       location: {
//         $near: {
//           $geometry: {
//             type: "point",
//             coordinates
//           }
//           // $maxDistance: 12000 //12Km
//         }
//       }
//     }
//   )
//     .sort({
//       score: { $meta: "textScore" }
//     })
//     .select("name description address location photo show private rate");
//   if (store.length === 0)
//     return res.status(404).json({ message: Language.fa.NoStoreFound });
//   res.json(store);
// };

// exports.searchStore = async (req, res) => {
//   const coordinates = [req.body.lng, req.body.lat].map(parseFloat);
//   data = req.body.query;
//   console.log("coordinates", coordinates);
//   const store = await Store.getTopStores(data, coordinates);

//   res.json(store);
// };

// Store Average Rate

exports.searchStore = async (req, res) => {
  const coordinates = [req.body.lng, req.body.lat].map(parseFloat);

  // const coordinates = [req.body.lng, req.body.lat].map(parseFloat);

  console.log(req.body.lng, req.body.lat);
  const store = await Store.find(
    {
      $text: {
        $search: req.body.query
      }
    },
    {
      density: { $meta: "textScore" }
    },
    {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates
          },
          maxDistance: 12000
        }
      }
    }
  )
    .select("name description address location photo show private rate")
    .populate("review ");
  res.json(store);
};

exports.storeFinder = async (req, res) => {
  res.json("Hi :)");
};

// Delete Store
exports.deleteStore = async (req, res) => {
  id = req.params.id;
  const store = await Store.findByIdAndRemove(id);
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });

  res.json(store);
};

require("dotenv").config();
const uuid = require("uuid");
const jimp = require("jimp");
const multer = require("multer");
const User = require("../models/user");
const Store = require("../models/Store");
const expressJwt = require("express-jwt");
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
  await photo.resize(500, jimp.AUTO);
  await photo.write(
    `./public/uploads/storeMainImage/${req.auth._id}/${req.body.photo}`
  );
  next();
};

// Upload and Update Store Photo
exports.updateStorePhoto = async (req, res) => {
  id = req.params.storeId;
  console.log("Buff", req.file.buffer);
  // const mphoto = req.body.photo;
  // const final = Buffer.from(mphoto, "base64");

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

// Get Store By Owner in mobile Store Section
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

// for preventing multipart import
// Post Single photo upload handler
exports.postResizePhoto = async (req, res, next) => {
  if (!req.file) return next();
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(500, jimp.AUTO);
  await photo.write(
    `./public/uploads/postImages/${req.auth._id}/${new Date().toISOString()}/${
      req.body.photo
    }`
  );
  next();
};

// Delete Store
exports.deleteStore = async (req, res) => {
  id = req.params.id;
  const store = await Store.findByIdAndRemove(id);
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });

  res.json(store);
};

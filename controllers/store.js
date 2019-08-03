const uuid = require("uuid");
const jimp = require("jimp");
const multer = require("multer");
const User = require("../models/user");
const Store = require("../models/store");
const Language = require("../helpers/Language");
const { multerOptions } = require("../helpers/Config");

//Single Photo Upload Handler
exports.singlePhotoUpload = multer(multerOptions).single("photo");

// Photo Resizing
exports.resizePhoto = async (req, res, next) => {
  const store = await Store.findOne({ storeOwner: req.body.id });
  if (store)
    return res.status(400).json({ message: "شما قبلا ثبت نام کرده اید" });

  if (!req.file) return next();

  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(500, jimp.AUTO);
  await photo.write(`./public/uploads/storeMainImage/${req.body.photo}`);
  next();
};

// Create Store
exports.craeteStore = async (req, res) => {
  req.body.location.type = "Point";

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
  res.json(store);
};

// Update Store
exports.updateStore = async (req, res) => {
  req.body.location.type = "Point";
  req.body.location.coordinates = [27, 23];
  const id = req.body.id;
  const store = await Store.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });
  res.json(store);
};

// Get Store By Id
exports.findStore = async (req, res) => {
  const store = await Store.findById(id);
  if (!store) return res.json({ message: Language.fa.NoStoreFound });
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

// Power To Act
exports.powerToAct = (req, res, next) => {
  const validUser = req.auth._id;
  const id = req.params.userId;

  const powerToAct = validUser == id;

  if (!powerToAct)
    return res.status(403).json({ message: Language.fa.UnAuthorized });
  next();
};

// Get Store ById
exports.getStore = async (req, res) => {
  const id = req.params.id;
  const store = await Store.findById(id).select("-__v -slug");
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });
  return res.json(store);
};

exports.getStoreByStoreOwner = async (req, res) => {
  const id = req.params.id;
  const store = await Store.findOne({ storeOwner: id }).select("-__v -slug");
  if (!store)
    return res.status(404).json({ message: Language.fa.NoStoreFound });
  return res.json(store);
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

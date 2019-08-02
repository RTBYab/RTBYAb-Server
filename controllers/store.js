// const User = require("../models/user");
const Store = require("../models/store");
const User = require("../models/user");
const Language = require("../helpers/Language");

// Create Store
exports.craeteStore = async (req, res) => {
  req.body.location.type = "Point";

  const id = req.params.userId;

  const storeExists = await Store.findOne({ storeOwner: id });
  if (storeExists)
    return res.status(403).json({ error: Language.fa.StorecraetedBefore });

  const store = await new Store(req.body);
  store.storeOwner = req.profile;

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

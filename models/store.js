const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;
const Language = require("../helpers/Language");
const slug = require("slugs");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 222
    },
    description: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 1200
    },
    storeOwner: {
      type: ObjectId,
      ref: "User"
    },
    created: {
      type: Date,
      default: Date.now
    },
    slug: String,
    tags: [String]
  },
  { timestamps: true }
);

storeSchema.pre("save", function(next) {
  if (!this.isModified("name")) {
    return next();
  }

  this.slug = slug(this.name);
  return next();
});

module.exports = mongoose.model("Store", storeSchema);

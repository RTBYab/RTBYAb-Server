const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
// mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 1200
    },
    date: {
      type: Date,
      default: Date.now
    },
    author: {
      type: ObjectId,
      ref: "User",
      required: true
    },
    store: {
      type: ObjectId,
      ref: "Store",
      required: true
    },
    rate: {
      type: Number,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 222
  },
  body: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1200
  },
  photo: {
    data: Buffer,
    contenType: String
  },
  postedBy: {
    type: ObjectId,
    ref: "User"
  },
  created: {
    type: Date,
    default: Date.now
  },

  updated: Date,

  likesBy: {
    type: ObjectId,
    ref: "User"
  },
  likes: [{ type: ObjectId, ref: "User" }],

  comments: [
    {
      text: { type: String },
      created: { type: Date, default: Date.now },
      commentedBy: { type: ObjectId, ref: "User" }
    }
  ]
});

module.exports = mongoose.model("Post", postSchema);

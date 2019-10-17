const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
    // required: true,
    // minlength: 2,
    // maxlength: 20
  },
  body: {
    type: String,
    trim: true
    // required: true,
    // minlength: 2,
    // maxlength: 150
  },
  photo: String,

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
      commentedBy: { type: ObjectId, ref: "User" },
      rate: { type: Number, default: 0 }
    }
  ]
});

module.exports = mongoose.model("Post", postSchema);

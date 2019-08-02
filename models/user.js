const mongoose = require("mongoose");
const uuidv4 = require("uuid/v4");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    hashed_password: {
      type: String,
      required: true
    },
    referalcode: {
      type: Number
    },
    salt: String,
    created: {
      type: Date,
      default: Date.now
    },
    updated: Date,
    photo: {
      data: Buffer,
      contentType: String
    },
    about: {
      type: String,
      trim: true
    },
    following: [{ type: ObjectId, ref: "User" }],
    followers: [{ type: ObjectId, ref: "User" }],
    resetPasswordLink: {
      data: String,
      default: ""
    },
    resetPasswordTime: Date,
    role: {
      type: String,
      default: "subscriber"
    },
    isActive: {
      type: Boolean,
      default: false
    },
    comments: [
      {
        text: String,
        created: { type: Date, default: Date.now },
        commentedBy: { type: ObjectId, ref: "User" }
      }
    ],
    comment: {
      type: String,
      date: Date.now
    },
    score: {
      type: Number,
      default: 0
    },
    referral: {
      type: String
    },
    report: [{ type: ObjectId, ref: "User" }]
  },

  { timestamps: true }
);

/**
 * Virtual fields are additional fields for a given model.
 * Their values can be set manually or automatically with defined functionality.
 * Keep in mind: virtual properties (password) don’t get persisted in the database.
 * They only exist logically and are not written to the document’s collection.
 */

// virtual field
userSchema
  .virtual("password")
  .set(function(password) {
    // create temporary variable called _password
    this._password = password;
    // generate an UUID
    this.salt = uuidv4();
    // encryptPassword()
    this.hashed_password = this.encryptPassword(password);
    // generate a refralCode
    this.referalcode = Math.floor(Math.random() * 1000000) + 17;
  })
  .get(function() {
    return this._password;
  });

// methods
userSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function(password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  }
};

module.exports = mongoose.model("User", userSchema);

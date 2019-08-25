const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const slug = require("slugs");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 222,
      lowercase: true
    },
    description: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 1200,
      lowercase: true
    },
    storeOwner: {
      type: ObjectId,
      ref: "User"
    },
    created: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: [
        {
          type: Number
          // required: "You must supply coordinates!"
        }
      ]
    },
    address: {
      type: String
      // required: true
    },
    show: {
      type: Boolean,
      default: true
    },
    photo: String,
    slug: String,
    tags: [String],
    private: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  }
);

// Index the Stores :)
storeSchema.index({
  name: "text",
  description: "text"
});

// Index Location(Long,Lat)
storeSchema.index({ location: "2dsphere" });

storeSchema.virtual("review", {
  ref: "Review",
  localField: "_id",
  foreignField: "store"
});

storeSchema.statics.getTopStores = function(data, coordinates) {
  return this.aggregate([
    {
      $match: { $text: { $search: data } }
    },
    {
      $lookup: {
        from: "review",
        localField: "_id",
        foreignField: "store",
        as: "reviews"
      }
    },
    {
      $addFields: {
        averageRating: { $avg: "$reviews.rating" },
        score: { $meta: "textScore" }
      }
    },

    { $sort: { averageRating: -1 } },

    { $limit: 10 }
  ]);
};

storeSchema.pre("save", async function(next) {
  if (!this.isModified("name")) return next();

  this.slug = slug(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  return next();
});

module.exports = mongoose.model("Store", storeSchema);

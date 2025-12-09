import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAvgRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: {
          $avg: "$rating",
        },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (result?.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      rating: result[0]?.averageRating,
      numReviews: result[0]?.numReviews,
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calculateAvgRating(this.product);
});

reviewSchema.post("remove", async function () {
  await this.constructor.calculateAvgRating(this.product);
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;

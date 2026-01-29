import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

export const addReviewService = async (req) => {
  const { productId, variantId, rating, comment } = req.body;
  const loggedInUserId = req.user.id;

  const requiredFields = ["productId", "variantId", "rating"];

  for (let field of requiredFields) {
    if (!req.body[field]) {
      throw new AppError(`${field} is required`, 400);
    }
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError(`Invalid ID: ${productId}`, 400);
  }
  if (!mongoose.isValidObjectId(variantId)) {
    throw new AppError(`Invalid ID: ${variantId}`, 400);
  }

  if (rating < 1 || rating > 5) {
    throw new AppError(`Rating need 1 to 5`, 400);
  }

  const product = await Product.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    throw new AppError(
      `Product not found for this IDs: ${productId}, ${variantId}`,
      400,
    );
  }
  const variant = product.variants.id(variantId);

  const existingReview = await Review.findOne({
    user: loggedInUserId,
    product: productId,
    variantId,
  });

  if (existingReview) {
    const oldRating = existingReview.rating;

    variant.ratingSum = variant.ratingSum - oldRating + rating;
    variant.ratingBreakdown[oldRating] -= 1;
    variant.ratingBreakdown[rating] += 1;

    existingReview.rating = rating;
    existingReview.comment = comment || existingReview.comment;
    await existingReview.save();
  } else {
    await Review.create({
      product: productId,
      variantId,
      user: loggedInUserId,
      rating,
      comment,
    });

    variant.ratingSum += rating;
    variant.numReviews += 1;
    variant.ratingBreakdown[rating] += 1;
  }

  variant.rating =
    variant.numReviews > 0 ? variant.ratingSum / variant.numReviews : 0;

  await product.save();

  return {
    status: 200,
    message: "Rating submitted successfully",
    rating: variant.rating.toFixed(1),
    numReviews: variant.numReviews,
    ratingBreakdown: variant.ratingBreakdown,
  };
};

export const getReviewsByProductAndVariantService = async (req) => {
  const { productId, variantId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  if (!productId) {
    throw new AppError("productId is required", 400);
  }
  if (!variantId) {
    throw new AppError("variantId is required", 400);
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError(`Invalid product ID: ${productId}`, 400);
  }

  if (!mongoose.isValidObjectId(variantId)) {
    throw new AppError(`Invalid variant ID: ${variantId}`, 400);
  }
  const [reviews, totalReviews] = await Promise.all([
    Review.find({ product: productId, variantId })
      .populate("user", "username email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Review.countDocuments({ product: productId, variantId }),
  ]);
  return {
    status: 200,
    message: `Fetched reviews successfully`,
    reviews,
    page,
    limit,
    totalPages: Math.ceil(totalReviews / limit),
  };
};

export const getSelectedProductReviewService = async (req) => {
  const { pId, vId } = req.params;

  if (!pId) {
    throw new AppError("Product Id required", 400);
  }
  if (!vId) {
    throw new AppError("Variant Id required", 400);
  }

  if (!mongoose.isValidObjectId(pId)) {
    throw new AppError(`Product Id is invalid: ${pId}`);
  }
  if (!mongoose.isValidObjectId(vId)) {
    throw new AppError(`Variant Id is invalid: ${vId}`);
  }

  const productId = new mongoose.Types.ObjectId(pId);
  const variantId = new mongoose.Types.ObjectId(vId);

  const productReview = await Product.aggregate([
    {
      $match: {
        _id: productId,
      },
    },
    {
      $addFields: {
        selectedVariantReview: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$variants",
                as: "variant",
                cond: { $eq: ["$$variant._id", variantId] },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        "selectedVariantReview.rating": 1,
        "selectedVariantReview.numReviews": 1,
        "selectedVariantReview.ratingSum": 1,
        "selectedVariantReview.ratingBreakdown": 1,
      },
    },
  ]);

  return {
    status: 200,
    success: "successfully fetched review for selected product",
    review: productReview?.[0]?.selectedVariantReview,
  };
};

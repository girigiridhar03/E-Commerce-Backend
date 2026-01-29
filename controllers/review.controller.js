import {
  addReviewService,
  getReviewsByProductAndVariantService,
  getSelectedProductReviewService,
} from "../services/review.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const addReview = asyncHandler(async (req, res) => {
  const { status, message, rating, numReviews, ratingBreakdown } =
    await addReviewService(req);

  response(res, status, message, { rating, numReviews, ratingBreakdown });
});

export const getReviewsByProductAndVariant = asyncHandler(async (req, res) => {
  const { status, message, reviews, page, limit, totalPages } =
    await getReviewsByProductAndVariantService(req);

  response(res, status, message, { reviews, page, limit, totalPages });
});

export const getSelectedProductReview = asyncHandler(async (req, res) => {
  const { status, message, review } =
    await getSelectedProductReviewService(req);

  response(res, status, message, review);
});

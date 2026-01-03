import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addReview, getReviewsByProductAndVariant } from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get(
  "/:productId/:variantId",
  authMiddleware,
  getReviewsByProductAndVariant
);

export default reviewRouter;

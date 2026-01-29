import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addReview,
  getReviewsByProductAndVariant,
  getSelectedProductReview,
} from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);

///// Dynamic Routes /////
reviewRouter.get(
  "/:productId/:variantId",
  authMiddleware,
  getReviewsByProductAndVariant,
);

reviewRouter.get(
  "/product/:pId/:vId",
  authMiddleware,
  getSelectedProductReview,
);

export default reviewRouter;

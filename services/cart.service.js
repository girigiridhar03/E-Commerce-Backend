import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import Cart from "../models/cart.model.js";

export const addToCartService = async (req) => {
  const loggedInUser = req.user;

  const { productId, variantId, quantity } = req.body;

  if (!productId) {
    throw new AppError("productId is required", 400);
  }
  if (!variantId) {
    throw new AppError("variantId is required", 400);
  }
  if (!quantity) {
    throw new AppError("quantity is required", 400);
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError(`Invalid productId: ${productId}`, 400);
  }
  if (!mongoose.isValidObjectId(variantId)) {
    throw new AppError(`Invalid variantId: ${variantId}`, 400);
  }

  if (quantity === undefined || quantity === null) {
    throw new AppError("quantity is required", 400);
  }

  if (typeof quantity !== "number" || quantity <= 0) {
    throw new AppError("quantity must be a positive number", 400);
  }

  const cart = await Cart.findOneAndUpdate(
    { user: loggedInUser.id, product: productId, variant: variantId },
    {
      $inc: { quantity },
      $setOnInsert: {
        user: loggedInUser.id,
        product: productId,
        variant: variantId,
      },
    },
    { new: true, upsert: true }
  );

  return {
    status: 200,
    message: "Item added to cart",
    cart,
  };
};

import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import Cart from "../models/cart.model.js";

export const addToCartService = async (req) => {
  const loggedInUser = req.user;
  if (!req.body) {
    throw new AppError("body is empty", 400);
  }

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

export const deleteCartItemService = async (req) => {
  const loggedInUser = req.user;
  const { productId, variantId } = req.params;

  if (!productId) {
    throw new AppError("productId is requried", 400);
  }

  if (!variantId) {
    throw new AppError("variantId is requried", 400);
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError(`Invalid productId: ${productId}`, 400);
  }

  if (!mongoose.isValidObjectId(variantId)) {
    throw new AppError(`Invalid variantId: ${variantId}`, 400);
  }

  const updatedCart = await Cart.findOneAndUpdate(
    {
      product: productId,
      variant: variantId,
      user: loggedInUser.id,
      quantity: { $gt: 1 },
    },
    {
      $inc: { quantity: -1 },
    },
    {
      new: true,
    }
  ).select("-createdAt -__v -updatedAt");

  if (updatedCart) {
    return {
      status: 200,
      message: "Item quantity decreased",
      result: updatedCart,
    };
  }

  const deletedResult = await Cart.deleteOne({
    product: productId,
    variant: variantId,
    user: loggedInUser.id,
  });

  if (deletedResult?.deletedCount === 0) {
    throw new AppError("Cart item not found", 404);
  }

  return {
    status: 200,
    message: "Item removed from the cart",
  };
};

export const clearCartItemsService = async (req) => {
  const loggedInUser = req.user.id;

  const result = await Cart.deleteMany({ user: loggedInUser });

  if (result.deletedCount === 0) {
    return {
      status: 200,
      message: "Cart already empty",
    };
  }

  return {
    status: 200,
    message: "cart items deleted successfully",
  };
};

export const cartItemsService = async (req) => {
  const loggedInUserId = req.user.id;

  const cartItems = await Cart.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(loggedInUserId),
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $addFields: {
        selectedVariant: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$productDetails.variants",
                as: "variant",
                cond: {
                  $eq: ["$$variant._id", "$variant"],
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        user: 0,
        variant: 0,
        product: 0,
        createdAt: 0,
        updatedAt: 0,
        "productDetails.__v": 0,
        "selectedVariant.updatedAt": 0,
        "selectedVariant.createdAt": 0,
        "productDetails.variants": 0,
        "productDetails.isDeleted": 0,
        "productDetails.isActive": 0,
      },
    },
    {
      $group: {
        _id: 0,
        cartItems: {
          $push: "$$ROOT",
        },
        totalAmount: {
          $sum: {
            $multiply: ["$selectedVariant.currentPrice", "$quantity"],
          },
        },
        totalProducts: {
          $sum: 1,
        },
        totalQuantity: {
          $sum: "$quantity",
        },
      },
    },
    {
      $project: {
        _id: 0,
        cartItems: 1,
        summary: {
          totalAmount: "$totalAmount",
          totalProducts: "$totalProducts",
          totalQuantity: "$totalQuantity",
        },
      },
    },
  ]);

  return {
    status: 200,
    message: "Fetched cart items",
    result: cartItems,
  };
};

export const cartCountService = async (req) => {
  const loggedInUserId = req.user.id;

  const cartItemCount  = await Cart.countDocuments({ user: loggedInUserId });

  return {
    status: 200,
    message: "Cart Total fetched successfully",
    count: cartItemCount ,
  };
};

import { AppError } from "../utils/AppError.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import mongoose from "mongoose";

export const createOrderService = async (req) => {
  if (!req.body) {
    throw new AppError("body is required", 400);
  }
  const loggedInUserId = req.user.id;
  const { deliveryAddress } = req.body;

  if (!deliveryAddress) {
    throw new AppError("delivery Address is required", 400);
  }

  const cartItems = await Cart.find({ user: loggedInUserId });

  if (cartItems.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const productIds = cartItems.map((item) => item.product);

  const products = await Product.find({ _id: { $in: productIds } });

  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cartItems) {
    const product = products.find(
      (item) => item._id.toString() === cartItem.product.toString()
    );

    if (!product) {
      throw new AppError(`${cartItem.product} is not found`, 404);
    }

    const variant = product.variants.find(
      (item) => item._id.toString() === cartItem.variant.toString()
    );

    if (!variant) {
      throw new AppError(`${cartItem.variant} is not found`, 404);
    }

    if (variant.stock < cartItem.quantity) {
      throw new AppError(`Insufficient stock for ${product.productName}`);
    }

    const priceAtPurchase = variant.currentPrice;
    const itemTotal = priceAtPurchase * cartItem.quantity;

    orderItems.push({
      productCreatedBy: product.productCreatedBy,
      product: product._id,
      variant: variant._id,
      priceAtPurchase,
      quantity: cartItem.quantity,
      itemTotal,
    });

    subtotal += itemTotal;
  }

  const order = await Order.create({
    user: loggedInUserId,
    orderItems,
    subtotal,
    totalAmount: subtotal,
    deliveryAddress,
  });

  return {
    status: 200,
    message: "order is created",
    order,
  };
};

export const getOrdersService = async (req) => {
  const vendorId = req.user.id;

  const orders = await Order.aggregate([
    {
      $unwind: "$orderItems",
    },
    {
      $match: {
        "orderItems.productCreatedBy": new mongoose.Types.ObjectId(vendorId),
      },
    },
    {
      $lookup: {
        from: "products",
        let: { variantId: "$orderItems.variant" },
        localField: "orderItems.product",
        foreignField: "_id",
        pipeline: [
          {
            $addFields: {
              selectedVariant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$variants",
                      as: "variant",
                      cond: { $eq: ["$$variant._id", "$$variantId"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $lookup: {
              from: "categories",
              let: { categoryId: "$category" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$categoryId"] },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                  },
                },
              ],
              as: "categoryDetails",
            },
          },
          {
            $unwind: "$categoryDetails",
          },
          {
            $project: {
              variants: 0,
              category: 0,
              __v: 0,
              rating: 0,
              numReviews: 0,
              isActive: 0,
              isDeleted: 0,
            },
          },
        ],
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
              profileImage: 1,
              phoneNumber: 1,
            },
          },
        ],
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        user: 0,
        "orderItems.product": 0,
        "orderItems.productCreatedBy": 0,
        "orderItems.variant": 0,
        __v: 0,
      },
    },
  ]);

  return {
    status: 200,
    message: "Orders fetched successfully",
    orders,
  };
};

import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addToCart,
  cartCount,
  cartItems,
  clearCartItems,
  deleteCartItem,
  deleteCartProduct,
} from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.post("/addToCart", authMiddleware, addToCart);
cartRouter.get("/cart-items", authMiddleware, cartItems);
cartRouter.delete("/clear-cart", authMiddleware, clearCartItems);
cartRouter.get("/cart-count", authMiddleware, cartCount);

///// Dynamic Routes /////
cartRouter.delete(
  "/deleteItem/:productId/:variantId",
  authMiddleware,
  deleteCartItem
);

cartRouter.delete(
  "/delete-product/:productId/:variantId",
  authMiddleware,
  deleteCartProduct
);

export default cartRouter;

import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addToCart,
  cartItems,
  clearCartItems,
  deleteCartItem,
} from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.post("/addToCart", authMiddleware, addToCart);
cartRouter.get("/cart-items", authMiddleware, cartItems);
cartRouter.delete("/clear-cart", authMiddleware, clearCartItems);

///// Dynamic Routes /////
cartRouter.delete(
  "/deleteItem/:productId/:variantId",
  authMiddleware,
  deleteCartItem
);

export default cartRouter;

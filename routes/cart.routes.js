import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addToCart } from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.post("/addToCart", authMiddleware, addToCart);

export default cartRouter;

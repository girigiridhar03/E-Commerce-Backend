import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createOrder } from "../controllers/order.controller.js";
const orderRouter = express.Router();

orderRouter.post("/create", authMiddleware, createOrder);

export default orderRouter;

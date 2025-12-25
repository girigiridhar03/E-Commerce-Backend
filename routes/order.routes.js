import express from "express";
import {
  authMiddleware,
  authorizeRole,
} from "../middleware/auth.middleware.js";
import { createOrder, getOrders } from "../controllers/order.controller.js";
const orderRouter = express.Router();

orderRouter.post("/create", authMiddleware, createOrder);
orderRouter.get(
  "/",
  authMiddleware,
  authorizeRole("vendor", "admin"),
  getOrders
);

export default orderRouter;

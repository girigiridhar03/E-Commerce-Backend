import express from "express";
import {
  authMiddleware,
  authorizeRole,
} from "../middleware/auth.middleware.js";
import {
  confirmOrder,
  createOrder,
  getOrders,
} from "../controllers/order.controller.js";
const orderRouter = express.Router();

orderRouter.post("/create", authMiddleware, createOrder);
orderRouter.get(
  "/",
  authMiddleware,
  authorizeRole("vendor", "admin"),
  getOrders
);

///// Dynamic Order /////
orderRouter.post("/:orderId/confirmOrder", authMiddleware, confirmOrder);

export default orderRouter;

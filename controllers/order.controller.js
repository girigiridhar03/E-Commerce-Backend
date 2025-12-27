import {
  confirmOrderService,
  createOrderService,
  getOrdersService,
} from "../services/order.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { status, message, order } = await createOrderService(req);

  response(res, status, message, order);
});

export const getOrders = asyncHandler(async (req, res) => {
  const { status, message, orders } = await getOrdersService(req);

  response(res, status, message, orders);
});

export const confirmOrder = asyncHandler(async (req, res) => {
  const { status, message, order } = await confirmOrderService(req);

  response(res, status, message, order);
});

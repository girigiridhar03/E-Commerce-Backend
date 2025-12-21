import { createOrderService } from "../services/order.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { status, message, order } = await createOrderService(req);

  response(res, status, message, order);
});

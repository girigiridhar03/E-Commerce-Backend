import { addToCartService } from "../services/cart.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const addToCart = asyncHandler(async (req, res) => {
  const { status, message, cart } = await addToCartService(req);
  response(res, status, message, cart);
});

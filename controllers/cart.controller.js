import {
  addToCartService,
  cartCountService,
  cartItemsService,
  clearCartItemsService,
  deleteCartItemService,
  deleteCartProductService,
} from "../services/cart.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const addToCart = asyncHandler(async (req, res) => {
  const { status, message, cart, cartSummary } = await addToCartService(req);
  response(res, status, message, { cart, cartSummary });
});

export const deleteCartItem = asyncHandler(async (req, res) => {
  const { status, message, result, summary } = await deleteCartItemService(req);
  response(res, status, message, { result, summary });
});

export const clearCartItems = asyncHandler(async (req, res) => {
  const { status, message } = await clearCartItemsService(req);
  response(res, status, message);
});

export const cartItems = asyncHandler(async (req, res) => {
  const { status, message, result } = await cartItemsService(req);

  response(res, status, message, result);
});

export const cartCount = asyncHandler(async (req, res) => {
  const { status, message, count } = await cartCountService(req);
  response(res, status, message, count);
});

export const deleteCartProduct = asyncHandler(async (req, res) => {
  const { status, message } = await deleteCartProductService(req);
  response(res, status, message);
});

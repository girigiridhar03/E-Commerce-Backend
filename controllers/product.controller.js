import {
  createProductService,
  getAllProductsService,
  singleProductDetailsService,
} from "../services/product.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const createProduct = asyncHandler(async (req, res) => {
  const result = await createProductService(req);

  response(res, result.status, result.message, result.data);
});

export const singleProductDetails = asyncHandler(async (req, res) => {
  const { status, message, details } = await singleProductDetailsService(req);
  response(res, status, message, details);
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const { status, message, products, totalProducts, totalPages, page, limit } =
    await getAllProductsService(req);

  response(res, status, message, {
    products,
    totalProducts,
    totalPages,
    page,
    limit,
  });
});

import {
  createProductService,
  getAllColorsService,
  getAllProductsService,
  getBrandsAndColorService,
  getOwnedProductsService,
  relatedProductsService,
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
  response(res, status, message, details?.[0]);
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

export const getBrandsAndColor = asyncHandler(async (_, res) => {
  const { status, message, result } = await getBrandsAndColorService();

  response(res, status, message, result);
});

export const releatedProducts = asyncHandler(async (req, res) => {
  const { status, message, relatedProducts } =
    await relatedProductsService(req);

  response(res, status, message, relatedProducts);
});

export const getOwnedProducts = asyncHandler(async (req, res) => {
  const { status, message, products, totalPages, limit, page, totalProducts } =
    await getOwnedProductsService(req);

  response(res, status, message, {
    products,
    totalPages,
    limit,
    page,
    totalProducts,
  });
});

export const getAllColors = asyncHandler(async (_, res) => {
  const { status, message, colors } = await getAllColorsService();
  response(res, status, message, colors);
});

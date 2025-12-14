import { createProductService } from "../services/product.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const createProduct = asyncHandler(async (req, res) => {
  const result = await createProductService(req);

  response(res, result.status, result.message, result.data);
});


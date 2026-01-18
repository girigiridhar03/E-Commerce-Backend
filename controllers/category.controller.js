import {
  addCategoryService,
  getCategoryNamesService,
} from "../services/category.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const addCategory = asyncHandler(async (req, res) => {
  const { status, message, newCategory } = await addCategoryService(req);
  response(res, status, message, newCategory);
});

export const getCategoryNames = asyncHandler(
  asyncHandler(async (_, res) => {
    const { status, message, names } = await getCategoryNamesService();
    response(res, status, message, names);
  }),
);

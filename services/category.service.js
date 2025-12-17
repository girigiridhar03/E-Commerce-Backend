import Category from "../models/category.model.js";
import { AppError } from "../utils/AppError.js";

export const addCategoryService = async (req) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError("name is required", 400);
  }

  const newCategory = new Category({ name });
  await newCategory.save();

  return {
    status: 201,
    message: `${name} is added successfully`,
    newCategory,
  };
};

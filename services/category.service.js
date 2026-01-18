import Category from "../models/category.model.js";
import { AppError } from "../utils/AppError.js";

export const addCategoryService = async (req) => {
  if (!req.body) {
    throw new AppError("body is empty", 400);
  }
  const { name, fields } = req.body;

  if (!Array.isArray(fields) || fields?.lenght === 0) {
    throw new AppError("Fields must be non-empty array", 400);
  }

  const allowedTypes = ["text", "number", "select"];

  fields.forEach((field, index) => {
    if (typeof field !== "object" || field === null) {
      throw new AppError(`Field at index: ${index} must be an object`, 400);
    }

    const { label, type, required } = field;

    if (!label || typeof label !== "string") {
      throw new AppError(`Field label is required at index: ${index}`, 400);
    }

    if (!type || !allowedTypes.includes(type)) {
      throw new AppError(
        `Invalid type for feild ${label}. Allowed: ${allowedTypes.join(", ")}`,
        400,
      );
    }

    if (required === undefined || typeof required !== "boolean") {
      throw new AppError(`Required must be boolean for field ${label}`, 400);
    }
  });

  if (!name) {
    throw new AppError("name is required", 400);
  }

  const newCategory = new Category({ name, fields });
  await newCategory.save();

  return {
    status: 201,
    message: `${name} is added successfully`,
    newCategory,
  };
};

export const getCategoryNamesService = async () => {
  const categoryNames = await Category.find({}).select("name");

  return {
    status: 200,
    message: "Fetched category names successfully.",
    names: categoryNames,
  };
};

export const categoryNamesAndFieldsService = async () => {
  const categoryNameAndFields = await Category.find({}).select("name fields");

  return {
    status: 200,
    message: "Fetched category names successfully.",
    nameAndFields: categoryNameAndFields,
  };
};

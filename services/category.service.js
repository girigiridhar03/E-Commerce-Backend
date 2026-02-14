import mongoose from "mongoose";
import Category from "../models/category.model.js";
import { AppError } from "../utils/AppError.js";
import Product from "../models/product.model.js";

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

  const ids = categoryNames?.map((item) => item?._id);

  const count = await Product.aggregate([
    {
      $match: {
        isActive: true,
        isDeleted: false,
        category: { $in: ids },
      },
    },
    {
      $group: {
        _id: "$category",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        count: 1,
      },
    },
  ]);
  const countMap = count.reduce((acc, item) => {
    acc[item.categoryId.toString()] = item.count;
    return acc;
  }, {});

  const categoryWithCount = categoryNames.map((cat) => ({
    _id: cat._id,
    name: cat.name,
    count: countMap[cat._id.toString()],
  }));

  return {
    status: 200,
    message: "Fetched category names successfully.",
    names: categoryWithCount,
  };
};

export const getSelectedFieldsService = async (req) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new AppError("categoryId is required", 400);
  }

  if (!mongoose.isValidObjectId(categoryId)) {
    throw new AppError(`Invalid ID: ${categoryId}`, 400);
  }

  const fields = await Category.findById(categoryId).select("fields");

  if (!fields) {
    throw new AppError(`Fields are not found for this ID: ${categoryId}`);
  }

  return {
    status: 200,
    message: "Fetched category names successfully.",
    fields,
  };
};

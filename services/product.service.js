import mongoose from "mongoose";
import { uploadToCloudinary } from "../config/cloudinary.js";
import Product from "../models/product.model.js";
import { AppError } from "../utils/AppError.js";

export const createProductService = async (req) => {
  try {
    let { productID, productName, description, category, brand } = req.body;

    const user = req.user;
    const images = req?.files;
    const tags = JSON.parse(req.body.tags);
    const variants = JSON.parse(req.body.variants);
    const attributes = JSON.parse(req.body.attributes);
    console.log(tags, variants, attributes);
    const requiredFields = [
      "productName",
      "description",
      "category",
      "tags",
      "variants",
      "brand",
      "attributes",
    ];

    if (!productID) {
      for (let field of requiredFields) {
        if (!req.body[field]) {
          throw new AppError(`${field} is required`, 400);
        }
      }
    }

    if (images?.length === 0) {
      throw new AppError("Product Images is required", 400);
    }

    const imagesResponse = await Promise.all(
      req?.files?.map(async (file) => {
        const result = await uploadToCloudinary(file?.path);
        return {
          url: result?.url,
          publicId: result?.public_id,
        };
      })
    );

    let product;

    if (productID) {
      if (!mongoose.isValidObjectId(productID)) {
        throw new AppError(`${productID} is not valid ID`, 400);
      }

      product = await Product.findById(productID);

      if (!product) throw new AppError("Product Not found", 404);

      const newVariant = {
        ...variants,
        attributes,
        images: imagesResponse,
      };

      product.variants.push(newVariant);
      await product.save();

      return {
        status: 200,
        message: `New Variant added to ${product.productName} successfully.`,
        data: product,
      };
    }

    const newProduct = new Product({
      productCreatedBy: user.id,
      productName,
      description,
      category,
      tags,
      brand,
      variants: [
        {
          ...variants,
          attributes,
          images: imagesResponse,
        },
      ],
    });
    await newProduct.save();

    return {
      status: 201,
      message: `New Product created successfully.`,
      data: newProduct,
    };
  } catch (error) {
    throw error;
  }
};

import mongoose from "mongoose";
import { uploadToCloudinary } from "../config/cloudinary.js";
import Product from "../models/product.model.js";
import { AppError } from "../utils/AppError.js";

export const createProductService = async (req) => {
  try {
    if (!req.body) {
      throw new AppError("body is empty", 400);
    }
    let { productID, productName, description, category, brand } = req.body;

    const user = req.user;
    const images = req?.files;
    const tags = req.body?.tags ? JSON.parse(req.body.tags) : null;
    const variants = req.body?.variants ? JSON.parse(req.body.variants) : null;
    const attributes = req.body?.attributes
      ? JSON.parse(req.body.attributes)
      : null;
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
    variants.description = description;
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

export const singleProductDetailsService = async (req) => {
  const { productId, variantId } = req.params;

  if (!productId) {
    throw new AppError("productId is required", 400);
  }
  if (!variantId) {
    throw new AppError("variantId is required", 400);
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError(`Invalid productId: ${productId}`);
  }
  if (!mongoose.isValidObjectId(variantId)) {
    throw new AppError(`Invalid productId: ${variantId}`);
  }

  const productObjectId = new mongoose.Types.ObjectId(productId);
  const variantObjectId = new mongoose.Types.ObjectId(variantId);

  const productDetails = await Product.aggregate([
    {
      $match: {
        _id: productObjectId,
      },
    },
    {
      $addFields: {
        selectedVariant: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$variants",
                as: "variant",
                cond: { $eq: ["$$variant._id", variantObjectId] },
              },
            },
            0,
          ],
        },
        otherVariants: {
          $filter: {
            input: "$variants",
            as: "variant",
            cond: {
              $ne: ["$$variant._id", variantObjectId],
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryId: "$category" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$categoryId"] },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
            },
          },
        ],
        as: "categoryDetails",
      },
    },
    {
      $unwind: {
        path: "$categoryDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        variants: 0,
        isActive: 0,
        isDeleted: 0,
        category: 0,
        productCreatedBy: 0,
      },
    },
  ]);

  return {
    status: 200,
    message: "Single Product details fetched successfully",
    details: productDetails,
  };
};

export const getAllProductsService = async (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  let sort = { createdAt: -1 };
  const search = req.query.search;
  const match = {
    isActive: true,
    isDeleted: false,
  };

  const SORT_MAP = {
    asc: 1,
    desc: -1,
  };

  const { sort: sortQuery } = req.query;

  if (SORT_MAP[sortQuery]) {
    sort = { currentPrice: SORT_MAP[sortQuery] };
  }

  if (search) {
    match.$text = { $search: search };
  }
  if (req.query.category && mongoose.isValidObjectId(req.query.category)) {
    match.category = req.query.category;
  }
  const aggregationPipeline = [
    {
      $match: match,
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryId: "$category" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$categoryId"] },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
            },
          },
        ],
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$categoryDetails",
    },
    {
      $unwind: "$variants",
    },
    {
      $match: {
        "variants.stock": { $gt: 0 },
      },
    },
    {
      $project: {
        _id: 1,
        productName: 1,
        brand: 1,
        slug: 1,
        description: "$variants.description",
        rating: 1,
        tags: 1,
        variantNumReviews: "$variants.numReviews",
        rating: "$variants.rating",
        ratingBreakDown: "$variants.ratingBreakdown",
        categoryDetails: 1,
        variantId: "$variants._id",
        sku: "$variants.sku",
        originalPrice: "$variants.originalPrice",
        discountPercent: "$variants.discountPercent",
        currentPrice: "$variants.currentPrice",
        stock: "$variants.stock",
        color: "$variants.color",
        images: "$variants.images",
        attributes: "$variants.attributes",
        createdAt: 1,
      },
    },
    {
      $sort: sort,
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const products = await Product.aggregate(aggregationPipeline);
  const totalCountAgg = await Product.aggregate([
    {
      $match: match,
    },
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $gt: 0 } } },
    { $count: "total" },
  ]);
  const totalProducts = totalCountAgg?.[0]?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  return {
    status: 200,
    message: `Fetched products`,
    products,
    totalProducts,
    totalPages,
    page,
    limit,
  };
};

export const getBrandsAndColorService = async () => {
  const productBrandColors = await Product.aggregate([
    {
      $facet: {
        brands: [
          {
            $match: {
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $group: {
              _id: "$brand",
            },
          },
          {
            $project: {
              _id: 0,
              name: "$_id",
            },
          },
          {
            $sort: {
              name: 1,
            },
          },
        ],

        colors: [
          {
            $match: {
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $unwind: "$variants",
          },
          {
            $group: {
              _id: "$variants.color",
            },
          },
          {
            $project: {
              _id: 0,
              name: "$_id",
            },
          },
          {
            $sort: {
              name: 1,
            },
          },
        ],
      },
    },
  ]);

  return {
    status: 200,
    message: "Fetched colors and brand names successfully",
    result: productBrandColors[0],
  };
};

export const relatedProductsService = async (req) => {
  const { selectedProductId } = req.params;

  if (!selectedProductId) {
    throw new AppError("Id is required", 400);
  }

  if (!mongoose.isValidObjectId(selectedProductId)) {
    throw new AppError(`Invalid ID: ${selectedProductId}`);
  }

  const selectedProduct = await Product.findById(selectedProductId);

  if (!selectedProduct) {
    throw new AppError("Product not found", 404);
  }

  const relatedProducts = await Product.aggregate([
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(selectedProductId) },
        $expr: {
          $gte: [
            { $size: { $setIntersection: ["$tags", selectedProduct.tags] } },
            2,
          ],
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryId: "$category" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$categoryId"] },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
            },
          },
        ],
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$categoryDetails",
    },
    {
      $addFields: {
        singleVariant: { $arrayElemAt: ["$variants", 0] },
      },
    },
    { $sort: { createdAt: -1 } },

    {
      $project: {
        variants: 0,
        productCreatedBy: 0,
        category: 0,
        isActive: 0,
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
        "singleVariant.rating": 0,
        "singleVariant.numReviews": 0,
        "singleVariant.ratingSum": 0,
        "singleVariant.ratingBreakdown": 0,
        "singleVariant.createdAt": 0,
        "singleVariant.updatedAt": 0,
        "singleVariant.stock": 0,
      },
    },
    {
      $limit: 4,
    },
  ]);
  return {
    status: 200,
    message: "Related products fetched successfully",
    relatedProducts,
  };
};

import mongoose from "mongoose";
import slugify from "slugify";

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      unique: true,
      trim: true,
    },

    originalPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    currentPrice: { type: Number },

    stock: { type: Number, required: true, min: 0 },

    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    attributes: {
      type: Map,
      of: String,
      required: true,
    },
  },
  { timestamps: true }
);

variantSchema.pre("save", function (next) {
  if (this.discountPercent > 0) {
    this.currentPrice =
      this.originalPrice - (this.originalPrice * this.discountPercent) / 100;
  } else {
    this.currentPrice = this.originalPrice;
  }
  next();
});

const productSchema = new mongoose.Schema(
  {
    productCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    tags: [{ type: String }],

    variants: [variantSchema],

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

variantSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = generateDynamicSKU(this.parent().productName, this.attributes);
  }

  next();
});
productSchema.index({ productCreatedBy: 1 });
productSchema.pre("save", function (next) {
  if (this.isModified("productName")) {
    this.slug = slugify(this.productName, {
      lower: true,
      strict: true,
    });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;

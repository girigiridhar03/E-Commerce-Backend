import mongoose from "mongoose";
import slugify from "slugify";

const attributes = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "text",
      required: true,
      enum: ["text", "number", "select"],
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  { __v: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    fields: [attributes],
  },
  { timestamps: true }
);

categorySchema.pre("save", async function () {
  if (!this.isModified("name")) return;
  this.slug = slugify(this.name, {
    lower: true,
    strict: true,
  });
});

const Category = mongoose.model("Category", categorySchema);

export default Category;

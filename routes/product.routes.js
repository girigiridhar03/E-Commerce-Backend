import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  createProduct,
  getAllProducts,
  getBrandsAndColor,
  singleProductDetails,
} from "../controllers/product.controller.js";
import {
  authMiddleware,
  authorizeRole,
} from "../middleware/auth.middleware.js";

const productRouter = express.Router();

productRouter.post(
  "/create-product",
  authMiddleware,
  authorizeRole("vendor", "admin"),
  upload.array("images", 5),
  createProduct
);

productRouter.get(
  "/single-product/:productId/:variantId",
  singleProductDetails
);

productRouter.get("/all-products", getAllProducts);
productRouter.get("/brand-colors", authMiddleware, getBrandsAndColor);
export default productRouter;

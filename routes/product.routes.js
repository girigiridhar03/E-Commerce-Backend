import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  createProduct,
  getAllColors,
  getAllProducts,
  getBrandsAndColor,
  getOwnedProducts,
  releatedProducts,
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
  createProduct,
);

productRouter.get("/all-products", authMiddleware, getAllProducts);
productRouter.get("/brand-colors", authMiddleware, getBrandsAndColor);
productRouter.get(
  "/my",
  authMiddleware,
  authorizeRole("vendor", "admin"),
  getOwnedProducts,
);
productRouter.get("/colors", authMiddleware, getAllColors);
///// Dynamic Routes /////
productRouter.get(
  "/single-product/:productId/:variantId",
  authMiddleware,
  singleProductDetails,
);
productRouter.get(
  "/related-products/:selectedProductId",
  authMiddleware,
  releatedProducts,
);
export default productRouter;

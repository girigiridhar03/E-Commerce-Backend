import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { createProduct } from "../controllers/product.controller.js";
import {
  authMiddleware,
  authorizeRole,
} from "../middleware/auth.middleware.js";

const productRouter = express.Router();

productRouter.post(
  "/product/create-product",
  authMiddleware,
  authorizeRole("vendor", "admin"),
  upload.array("images", 5),
  createProduct
);

export default productRouter;

import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { createProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.post("/product/create-product", upload.array("images", 5), createProduct);

export default productRouter;

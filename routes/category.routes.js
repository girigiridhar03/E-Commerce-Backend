import express from "express";
import {
  authMiddleware,
  authorizeRole,
} from "../middleware/auth.middleware.js";
import {
  addCategory,
  getCategoryNames,
  getSelectedFields,
} from "../controllers/category.controller.js";

const category = express.Router();

category.post(
  "/new",
  authMiddleware,
  authorizeRole("admin", "vendor"),
  addCategory,
);

category.get("/", authMiddleware, getCategoryNames);

///// Dynamic Routes /////
category.get("/:categoryId", authMiddleware, getSelectedFields);

export default category;

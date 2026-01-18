import express from "express";
import {
  authMiddleware,
  authorizeRole,
} from "../middleware/auth.middleware.js";
import {
  addCategory,
  categoryNamesAndFields,
  getCategoryNames,
} from "../controllers/category.controller.js";

const category = express.Router();

category.post(
  "/new",
  authMiddleware,
  authorizeRole("admin", "vendor"),
  addCategory,
);

category.get("/", authMiddleware, getCategoryNames);
category.get("/name-fields", authMiddleware, categoryNamesAndFields);

export default category;

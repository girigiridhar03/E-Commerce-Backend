import express from "express";
import { authMiddleware, authorizeRole } from "../middleware/auth.middleware.js";
import { addCategory } from "../controllers/category.controller.js";

const category = express.Router();

category.post(
  "/new",
  authMiddleware,
  authorizeRole("admin", "vendor"),
  addCategory
);

export default category;

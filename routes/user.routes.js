import express from "express";
import {
  getNewUsers,
  getSignUpTrends,
  getUserRoleDistribution,
  getUserStats,
  login,
  me,
  signup,
  singleUserDetails,
  verifyEmail,
} from "../controllers/user.controller.js";
import {
  authMiddleware,
  authorizeRole,
} from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const userRouter = express.Router();

///// Auth Routes /////
userRouter.post("/signup", upload.single("image"), signup);
userRouter.post("/verify-email/:token", verifyEmail);
userRouter.post("/login", login);
userRouter.get("/me", authMiddleware, me);
///// Analytics Dashboard Routes /////
userRouter.get(
  "/user/analytics/user-stats",
  authMiddleware,
  authorizeRole("admin"),
  getUserStats,
);

userRouter.get(
  "/user/analytics/signup-trends",
  authMiddleware,
  authorizeRole("admin"),
  getSignUpTrends,
);
userRouter.get(
  "/user/analytics/role-count",
  authMiddleware,
  authorizeRole("admin"),
  getUserRoleDistribution,
);
userRouter.get(
  "/user/analytics/new-users",
  authMiddleware,
  authorizeRole("admin"),
  getNewUsers,
);

///// Dynamic Routes /////
userRouter.get("/user/:id", authMiddleware, singleUserDetails);

export default userRouter;

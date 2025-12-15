import express from "express";
import {
  getNewUsers,
  getSignUpTrends,
  getUserRoleDistribution,
  getUserStats,
  login,
  signup,
  verifyEmail,
} from "../controllers/user.controller.js";
import {
  authMiddleware,
  authorizeRole,
} from "../middleware/auth.middleware.js";

const userRouter = express.Router();

///// Auth Routes /////
userRouter.post("/signup", signup);
userRouter.post("/verify-email/:token", verifyEmail);
userRouter.post("/login", login);

///// Analytics Dashboard Routes /////
userRouter.get(
  "/analytics/user-stats",
  //   authMiddleware,
  //   authorizeRole("admin"),
  getUserStats
);

userRouter.get("/analytics/signup-trends", getSignUpTrends);
userRouter.get("/analytics/role-count", getUserRoleDistribution);
userRouter.get("/analytics/new-users", getNewUsers);

export default userRouter;

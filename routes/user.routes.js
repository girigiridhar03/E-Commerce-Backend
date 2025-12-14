import express from "express";
import { login, signup, verifyEmail } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/verify-email/:token", verifyEmail);
userRouter.post("/login", login);

export default userRouter;

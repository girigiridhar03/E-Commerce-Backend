import express from "express";
import { signup, verifyEmail } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/verify-email/:token", verifyEmail);

export default userRouter;

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Files of Routers
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";

// Routes
app.use("/api", userRouter);
app.use("/api", productRouter);

// ErrorHandler
import { errorHandler } from "./utils/handlers.js";
app.use(errorHandler);

export default app;

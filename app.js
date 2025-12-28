import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

const app = express();

const allowOrigin = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin || allowOrigin.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by cors"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Files of Routers
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import category from "./routes/category.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";

// Routes
app.use("/api", userRouter);
app.use("/api/product", productRouter);
app.use("/api/category", category);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
// ErrorHandler
import { errorHandler } from "./utils/handlers.js";
app.use(errorHandler);

export default app;

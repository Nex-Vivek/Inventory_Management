import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
const app = express();
const PORT = process.env.PORT || 8000;

// CORS: allow multiple origins (production + local dev)
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://inventory-indol-five.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res
    .status(500)
    .json({ success: false, message: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

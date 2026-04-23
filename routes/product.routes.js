import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";
import { isLoggedIn, isAdmin } from "../middleware/authmiddleware.js";

const router = Router();

// Both roles can read products
router.get("/", isLoggedIn, getAllProducts);
router.get("/:id", isLoggedIn, getProductById);

// Only admin can write
router.post("/", isLoggedIn, isAdmin, createProduct);
router.put("/:id", isLoggedIn, isAdmin, updateProduct);
router.delete("/:id", isLoggedIn, isAdmin, deleteProduct);

export default router;

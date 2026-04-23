import { Router } from "express";
import { login, logout, getMe } from "../Controller/admin.controller.js";
import { isLoggedIn } from "../middleware/authmiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout", isLoggedIn, logout);
router.get("/me", isLoggedIn, getMe); 

export default router;


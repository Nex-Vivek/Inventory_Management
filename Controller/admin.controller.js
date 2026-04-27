import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "clothstock_jwt_secret_2024";
const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24, // 1 day
};

// ── POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Create JWT payload (never store password!)
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    // Set HTTP-only cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: payload,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
}

// ── POST /api/auth/logout
export function logout(req, res) {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out successfully." });
}

// ── GET /api/auth/me
export function getMe(req, res) {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({
      success: true,
      user: decoded,
    });
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
}


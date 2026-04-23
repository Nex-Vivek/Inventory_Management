import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

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

    // User not found
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Check password
    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    //  Credentials match — save to session (never store password in session!)
    req.session.user = {
      id: user.id,
      //name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
}

//    ── POST /api/auth/logout

export function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Logout failed." });
    }
    res.clearCookie("connect.sid"); // Remove session cookie from browser
    res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  });
}

// Frontend calls this on page load to check if session is still active
export function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.session.user,
  });
}

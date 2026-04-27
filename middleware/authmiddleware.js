import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "clothstock_jwt_secret_2024";

// Verify JWT from HTTP-only cookie and attach decoded user to req.user
export function isLoggedIn(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Please login to continue." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
}

// Check if the logged-in user is an admin
export function isAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    return next();
  }
  res
    .status(403)
    .json({ success: false, message: "Access denied. Admins only." });
}

// Check if the logged-in user is a manager (or admin — admins can do everything)
export function isManager(req, res, next) {
  const role = req.user?.role;
  if (role === "manager" || role === "admin") {
    return next();
  }
  res
    .status(403)
    .json({ success: false, message: "Access denied. Managers only." });
}


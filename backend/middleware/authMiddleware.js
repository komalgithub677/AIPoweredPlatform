// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // { _id, email, role, name, ... }
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ error: "Token failed or expired" });
  }
};

export const requireManager = (req, res, next) => {
  if (req.user && req.user.role === "manager") return next();
  return res.status(403).json({ error: "Manager access only" });
};

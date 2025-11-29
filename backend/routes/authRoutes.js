// routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js"; // ⬅ Required for invite system

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* ===========================  REGISTER  =========================== */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, inviteId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ⛔ Prevent duplicate registration
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    /*  🟢 FIRST USER IN SYSTEM = MANAGER
        🟡 If inviteId is present => member only
        🔥 Else new user without invite = member (unless first user)
    */
    const userCount = await User.countDocuments();
    let role = userCount === 0 ? "manager" : "member";

    // If registered through invite → force role = member
    if (inviteId) role = "member";

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPass,
      role,
    });

    /* ------------------ IF INVITED — MARK ACCEPTED ------------------ */
    if (inviteId) {
      await Invitation.findByIdAndUpdate(inviteId, { status: "accepted" });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===========================  LOGIN  =========================== */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

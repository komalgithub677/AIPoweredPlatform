import express from "express";
import { protect, requireManager } from "../middleware/authMiddleware.js";
import Invitation from "../models/Invitation.js";
import User from "../models/User.js";

const router = express.Router();

// Invite Member
router.post("/invite", protect, requireManager, async (req, res) => {
  try {
    const { email } = req.body;

    // Validate
    if (!email) return res.status(400).json({ error: "Email required" });

    // Already user exists → no invite
    const already = await User.findOne({ email });
    if (already) return res.status(400).json({ error: "User already registered" });

    const invite = await Invitation.create({
      email,
      invitedBy: req.user._id,
      role: "member"
    });

    return res.status(201).json({ message: "Invitation created", invite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all invites sent by manager
router.get("/invites", protect, requireManager, async (req, res) => {
  const invites = await Invitation.find({ invitedBy: req.user._id });
  res.json(invites);
});

export default router;

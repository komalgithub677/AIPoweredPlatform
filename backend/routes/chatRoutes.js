import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Message from "./models/Message.js";   // ← FIXED path

const router = express.Router();

// 📩 GET chat messages for a team
router.get("/:teamId", protect, async (req, res) => {
  try {
    const { teamId } = req.params;
    const messages = await Message.find({ teamId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Fetch chat error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

import express from "express";
import Team from "../models/Team.js";
import { protect, requireManager } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Fetch only teams user belongs to */
router.get("/", protect, async (req, res) => {
  try {
    const email = req.user.email;
    const teams = await Team.find({
      $or: [{ createdBy: req.user._id }, { members: email }]
    });
    res.json(teams);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

/* Create team → Only MANAGER */
router.post("/", protect, requireManager, async (req, res) => {
  try {
    const { name, domain, members } = req.body;
    if (!name) return res.status(400).json({ error: "Team name required" });

    const team = await Team.create({
      name,
      domain,
      members,
      createdBy: req.user._id
    });

    res.status(201).json(team);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

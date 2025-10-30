import express from "express";
import Team from "../models/Team.js";

const router = express.Router();

// Create a new team
router.post("/", async (req, res) => {
  try {
    const { name, domain, members } = req.body;
    const team = new Team({ name, domain, members });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create team" });
  }
});

// Get all teams
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teams" });
  }
});

export default router;

import express from "express";
import auth from "../middleware/auth.js";
import Activity from "../models/Activity.js";

const router = express.Router();

router.get("/team/:id", auth, async (req, res) => {
  try {
    const activities = await Activity.find({ team: req.params.id })
      .populate("user")
      .sort({ timestamp: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

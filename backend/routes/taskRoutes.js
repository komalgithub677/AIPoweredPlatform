// routes/taskRoutes.js
import express from "express";
import Task from "../models/Task.js";
import { protect, requireManager } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/tasks - all tasks for teams the user belongs to
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Fetch tasks error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/tasks - manager creates task
router.post("/", protect, requireManager, async (req, res) => {
  try {
    const { title, desc, teamId, assignedTo } = req.body;

    if (!title || !teamId) {
      return res.status(400).json({ error: "Title and teamId are required" });
    }

    const task = await Task.create({
      title,
      desc,
      teamId,
      assignedTo: assignedTo || [],
      createdBy: req.user._id,
    });

    // emit event via socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(String(teamId)).emit("taskCreated", task);
    }

    res.status(201).json(task);
  } catch (err) {
    console.error("Create task error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/tasks/:id/status - update task column for Kanban
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    const io = req.app.get("io");
    if (io) {
      io.to(String(task.teamId)).emit("taskUpdated", task);
    }

    res.json(task);
  } catch (err) {
    console.error("Update task status error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

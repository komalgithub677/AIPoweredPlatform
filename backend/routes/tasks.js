import express from "express";
import Task from "../models/Task.js";
import { sendEmail } from "../server.js";

const router = express.Router();

// Create a new task
router.post("/", async (req, res) => {
  const io = req.app.get("io");
  try {
    const { title, desc, teamId, assignedTo, createdBy } = req.body;

    const task = new Task({ title, desc, teamId, assignedTo, createdBy });
    await task.save();

    // Send emails to assigned members
    assignedTo.forEach((email) => {
      sendEmail({
        to: email,
        subject: `New Task Assigned: ${title}`,
        text: `Hi,\n\nYou have been assigned a new task: "${title}"\nDescription: ${desc}\nTeam ID: ${teamId}`,
      });
    });

    // Emit real-time notification to frontend
    io.emit("taskCreated", task);

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Task creation failed" });
  }
});

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

export default router;

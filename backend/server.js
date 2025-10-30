// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import nodemailer from "nodemailer";

// Routes
import activitiesRoutes from "./routes/activities.js";
import tasksRoutes from "./routes/tasks.js";
import teamsRoutes from "./routes/teams.js";
import authRoutes from "./routes/auth.js";
import ideaGenerationRoutes from "./routes/ideaGeneration.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/idea", ideaGenerationRoutes); // ✅ Idea Generation route

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Server + Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

io.on("connection", (socket) => {
  console.log("⚡ User connected");
  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// Make io available in routes
app.set("io", io);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email sending utility
export const sendEmail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: `"Project Management App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

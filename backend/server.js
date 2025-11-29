import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// MODELS
import Message from "../models/Message.js";   // 🔥 required for chat handling

dotenv.config();

// APP + SOCKET SERVER
const app = express();
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Make io available everywhere
app.set("io", io);

// MIDDLEWARE
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// REST APIs
app.use("/api/auth", authRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send({
    status: "Server Running 🚀",
    message: "AI Ideation & Project Management Backend with Live Realtime",
  });
});


// 📡 SOCKET.IO CONNECTION
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  // Joined a TEAM ROOM
  socket.on("joinTeam", (teamId) => {
    socket.join(String(teamId));
    console.log(`📌 ${socket.id} joined room → ${teamId}`);
  });

  // Real-time CHAT
  socket.on("chatMessage", async ({ teamId, sender, text }) => {
    try {
      const msg = await Message.create({ teamId, sender, text });
      io.to(String(teamId)).emit("chatMessage", msg);
      console.log("💬 Message Sent:", msg.text);
    } catch (err) {
      console.error("Chat save error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Backend Running on http://localhost:${PORT}`)
);

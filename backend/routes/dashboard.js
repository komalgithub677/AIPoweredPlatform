import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to your dashboard",
    user: req.user,
  });
});

export default router;

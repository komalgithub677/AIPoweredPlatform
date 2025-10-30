import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { domain, project } = req.body;

    if (!domain || !project) {
      return res.status(400).json({ error: "Domain and project are required" });
    }

    // Gemini API request
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gemini-1.5-t",
        messages: [
          { role: "system", content: "You are an AI assistant that generates innovative project ideas." },
          { role: "user", content: `Generate 5 concise and creative ideas for a ${domain} project titled "${project}".` }
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const ideas = response.data.choices[0].message.content;

    res.json({ ideas });
  } catch (err) {
    console.error("Idea generation error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate ideas" });
  }
});

export default router;

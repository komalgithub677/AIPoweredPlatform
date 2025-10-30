import express from "express";
import axios from "axios"; // For calling Gemini API
const router = express.Router();

// POST /api/idea
router.post("/", async (req, res) => {
  const { domain } = req.body;

  if (!domain || !domain.trim()) {
    return res.status(400).json({ error: "Domain is required" });
  }

  try {
    // Replace this with actual Gemini API call
    const apiResponse = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-5.1-mini", // Gemini AI model
        input: `Suggest one innovative project idea for the domain: ${domain}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const generatedIdea = apiResponse.data.output_text || "No idea generated.";
    res.json({ idea: generatedIdea });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate idea" });
  }
});

export default router;

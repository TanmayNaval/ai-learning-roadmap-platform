import express from "express";
import UserInput from "../models/UserInput.js";

const router = express.Router();

const apiKey = process.env.GROQ_API_KEY?.trim();
if (!apiKey || apiKey === "your-groq-api-key-here") {
  throw new Error("GROQ_API_KEY is missing in .env. Get a free key at https://console.groq.com/keys");
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function generateWithGroq(prompt) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Invalid GROQ_API_KEY. Update backend/.env with a valid key from https://console.groq.com/keys");
    }
    const msg = data?.error?.message || data?.message || res.statusText;
    const lower = (msg || "").toLowerCase();
    if (lower.includes("invalid") && lower.includes("key")) {
      throw new Error("Invalid GROQ API key configured. Please set GROQ_API_KEY in backend/.env");
    }
    throw new Error(msg);
  }
  const text = data?.choices?.[0]?.message?.content;
  return text ?? "";
}

router.post("/generate", async (req, res) => {
  try {
    const { name, skills, interests, goals } = req.body;
    const prompt = `User: ${name}
Skills: ${skills}
Interests: ${interests}
Goals: ${goals}
Create a step-by-step career roadmap.`;

    const roadmap = await generateWithGroq(prompt);

    await UserInput.create({
      name,
      skills,
      interests,
      goals,
      roadmap
    });

    res.json({ roadmap });
  } catch (err) {
    console.error(err);
    const message = err.message || "Failed to generate roadmap";
    const status = message.toLowerCase().includes("invalid groq api key") || message.toLowerCase().includes("invalid api key") ? 401 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;

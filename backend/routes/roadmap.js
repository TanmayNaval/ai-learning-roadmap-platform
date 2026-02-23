import express from "express";
import UserInput from "../models/UserInput.js";

const router = express.Router();

const apiKey = process.env.GROQ_API_KEY?.trim();
if (!apiKey || apiKey === "your-groq-api-key-here") {
  throw new Error("GROQ_API_KEY is missing in .env. Get a free key at https://console.groq.com/keys");
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function extractJsonObject(text) {
  const cleaned = (text || "").trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return cleaned.slice(start, end + 1);
}

function toArray(value) {
  return Array.isArray(value) ? value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean) : [];
}

function normalizeRoadmapData(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  const phases = Array.isArray(parsed.phases)
    ? parsed.phases.slice(0, 4).map((phase, index) => ({
      title: String(phase?.title || `Phase ${index + 1}`).trim(),
      duration: String(phase?.duration || "2-4 weeks").trim(),
      focus: String(phase?.focus || "").trim(),
      actions: toArray(phase?.actions).slice(0, 5),
      projects: toArray(phase?.projects).slice(0, 3),
      resources: toArray(phase?.resources).slice(0, 4)
    }))
    : [];

  return {
    summary: String(parsed.summary || "").trim(),
    weeklyPlan: toArray(parsed.weeklyPlan).slice(0, 5),
    phases
  };
}

function buildRoadmapText(roadmapData) {
  const lines = [];
  if (roadmapData.summary) lines.push(`Summary: ${roadmapData.summary}`);
  if (roadmapData.weeklyPlan.length) {
    lines.push("", "Weekly plan:");
    roadmapData.weeklyPlan.forEach((step, idx) => lines.push(`${idx + 1}. ${step}`));
  }
  roadmapData.phases.forEach((phase, idx) => {
    lines.push("", `${idx + 1}. ${phase.title} (${phase.duration})`);
    if (phase.focus) lines.push(`Focus: ${phase.focus}`);
    if (phase.actions.length) {
      lines.push("Actions:");
      phase.actions.forEach((action) => lines.push(`- ${action}`));
    }
    if (phase.projects.length) {
      lines.push("Projects:");
      phase.projects.forEach((project) => lines.push(`- ${project}`));
    }
    if (phase.resources.length) {
      lines.push("Resources:");
      phase.resources.forEach((resource) => lines.push(`- ${resource}`));
    }
  });
  return lines.join("\n");
}

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
  const content = data?.choices?.[0]?.message?.content || "";
  const rawJson = extractJsonObject(content);
  if (!rawJson) {
    throw new Error("Could not parse AI response. Please try again.");
  }
  const parsed = JSON.parse(rawJson);
  const roadmapData = normalizeRoadmapData(parsed);
  if (!roadmapData || !roadmapData.phases.length) {
    throw new Error("Could not build a structured roadmap. Please try again.");
  }
  return roadmapData;
}

router.post("/generate", async (req, res) => {
  try {
    const { name, skills, interests, goals } = req.body;
    const prompt = `Create a concise AI career roadmap in JSON only.
Return ONLY valid JSON with this exact shape:
{
  "summary": "1-2 sentence summary",
  "weeklyPlan": ["max 5 short bullets"],
  "phases": [
    {
      "title": "phase title",
      "duration": "e.g. 2 weeks",
      "focus": "single sentence focus",
      "actions": ["3-5 concrete actions"],
      "projects": ["1-3 project ideas"],
      "resources": ["2-4 resources/certifications"]
    }
  ]
}
Rules:
- Keep total output concise and practical.
- No greeting, no markdown, no explanation outside JSON.
- Max 4 phases.

User profile:
Name: ${name}
Skills: ${skills}
Interests: ${interests}
Goals: ${goals}`;

    const roadmapData = await generateWithGroq(prompt);
    const roadmap = buildRoadmapText(roadmapData);

    await UserInput.create({
      name,
      skills,
      interests,
      goals,
      roadmap
    });

    res.json({ roadmap, roadmapData });
  } catch (err) {
    console.error(err);
    const message = err.message || "Failed to generate roadmap";
    const status = message.toLowerCase().includes("invalid groq api key") || message.toLowerCase().includes("invalid api key") ? 401 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;

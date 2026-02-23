import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import roadmapRoutes from "./routes/roadmap.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const groqApiKey = process.env.GROQ_API_KEY?.trim();
if (!groqApiKey || groqApiKey === "your-groq-api-key-here") {
  console.error(
    "GROQ_API_KEY is missing or still set to placeholder. Set a real key in backend/.env (https://console.groq.com/keys)"
  );
  process.exit(1);
}
if (!groqApiKey.startsWith("gsk_")) {
  console.error("GROQ_API_KEY looks invalid for Groq. It should start with 'gsk_'. Get one from https://console.groq.com/keys");
  process.exit(1);
}

const app = express();

connectDB();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (curl/postman) and same-origin requests.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked for this origin"));
  }
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Root route (health check) – define first so GET / works
app.get("/", (req, res) => {
  res.json({ ok: true, message: "AI Learning Roadmap API", docs: "POST /api/roadmap/generate" });
});

// Routes
app.use("/api/roadmap", roadmapRoutes);

// Port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});

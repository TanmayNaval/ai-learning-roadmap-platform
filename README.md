# AI Learning Roadmap Platform

A full-stack app that generates a personalized AI career roadmap based on your skills, interests, and goals.

- `frontend`: Next.js UI
- `backend`: Express API + MongoDB + Groq LLM API

## Features

- Professional responsive UI
- AI roadmap generation from custom user input
- Stores generated roadmaps in MongoDB
- Clear API key validation and error messages

## Tech Stack

- Frontend: Next.js 14, React
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas
- LLM Provider: Groq (`gsk_...` API key)

## Project Structure

```text
ai-learning-roadmap-platform/
  frontend/
  backend/
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection string
- Groq API key from https://console.groq.com/keys

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=gsk_your_real_key
FRONTEND_URL=http://localhost:3000
```

Start backend:

```bash
npm run dev
```

or

```bash
npm start
```

Backend runs on: `http://localhost:5001`

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on: `http://localhost:3000`

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## How To Use

1. Open `http://localhost:3000`
2. Fill Name, Skills, Interests, and Goals
3. Click **Generate Roadmap**
4. View generated roadmap in the output panel

## API Endpoint

`POST /api/roadmap/generate`

Example request body:

```json
{
  "name": "Tanmay",
  "skills": "Python, SQL",
  "interests": "LLMs, AI engineering",
  "goals": "Get an AI Engineer role in 6 months"
}
```

## Share With Friends / Use On Other Devices

1. Push code to GitHub (already done)
2. Clone on another device:

```bash
git clone https://github.com/TanmayNaval/ai-learning-roadmap-platform.git
cd ai-learning-roadmap-platform
```

3. Repeat backend and frontend setup steps
4. Create a fresh `backend/.env` on that device

Important:
- `.env` is not committed to git
- Never share your real `GROQ_API_KEY`

## Deployment (Quick Direction)

- Frontend: deploy to Vercel
- Backend: deploy to Render/Railway
- Database: keep using MongoDB Atlas
- Add backend env vars in hosting provider:
  - `MONGO_URI`
  - `GROQ_API_KEY`
  - `FRONTEND_URL=https://your-frontend-domain.vercel.app`
- Add frontend env var in Vercel:
  - `NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com`

## Troubleshooting

- `Invalid GROQ_API_KEY`: ensure key starts with `gsk_` and has no extra characters
- `MONGO_URI` errors: verify Atlas username/password/database and network access
- CORS/network issues: make sure backend is running on port `5001`

## License

For personal/educational use.

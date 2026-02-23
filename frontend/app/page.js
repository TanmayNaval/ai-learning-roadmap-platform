"use client";

import { useMemo, useState } from "react";

const initialForm = { name: "", skills: "", interests: "", goals: "" };

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [roadmap, setRoadmap] = useState("");
  const [status, setStatus] = useState("idle");

  const canSubmit = useMemo(() => {
    return Object.values(form).every((value) => value.trim().length > 0) && status !== "loading";
  }, [form, status]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    if (!canSubmit) return;

    setStatus("loading");
    setRoadmap("Building your roadmap...");

    try {
      const res = await fetch("http://localhost:5001/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setRoadmap(`Error: ${data.error || res.statusText}`);
        return;
      }

      setStatus("success");
      setRoadmap(data.roadmap || "No roadmap was returned.");
    } catch (error) {
      setStatus("error");
      setRoadmap(`Error: ${error.message || "Request failed"}`);
    }
  };

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <section className="hero">
        <p className="badge">Career Planning Assistant</p>
        <h1>Design Your AI Career Roadmap</h1>
        <p className="subtext">
          Share your background and goals, then generate a practical step-by-step plan tailored to your next role.
        </p>
      </section>

      <section className="workspace">
        <article className="panel panel-form">
          <h2>Profile Inputs</h2>
          <p className="hint">Fill all fields for better roadmap quality.</p>

          <label htmlFor="name">Name</label>
          <input
            id="name"
            placeholder="e.g. Tanmay"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <label htmlFor="skills">Current Skills</label>
          <textarea
            id="skills"
            rows={3}
            placeholder="Python, SQL, data structures, React..."
            value={form.skills}
            onChange={(e) => updateField("skills", e.target.value)}
          />

          <label htmlFor="interests">Interests</label>
          <textarea
            id="interests"
            rows={3}
            placeholder="LLMs, computer vision, product AI, research..."
            value={form.interests}
            onChange={(e) => updateField("interests", e.target.value)}
          />

          <label htmlFor="goals">Career Goals</label>
          <textarea
            id="goals"
            rows={3}
            placeholder="Get an AI engineer role in 6 months..."
            value={form.goals}
            onChange={(e) => updateField("goals", e.target.value)}
          />

          <button type="button" onClick={submit} disabled={!canSubmit}>
            {status === "loading" ? "Generating..." : "Generate Roadmap"}
          </button>
        </article>

        <article className="panel panel-output">
          <div className="panel-header">
            <h2>Generated Roadmap</h2>
            <span className={`status-pill status-${status}`}>{status}</span>
          </div>
          <pre>{roadmap || "Your roadmap will appear here after generation."}</pre>
        </article>
      </section>
    </main>
  );
}

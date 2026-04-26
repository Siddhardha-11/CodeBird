const loadEnvFile = require("./env");
const express = require("express");
const { fallbackNextQuestion, formatQuestionWarning, generateNextQuestion } = require("./gemini");
const runSandbox = require("./sandbox");
const generateRoute = require("./routes/generate");

loadEnvFile();

const app = express();

// 🔥 1. CORS FIRST (MOST IMPORTANT)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// 🔥 2. THEN JSON
app.use(express.json());

// 🔥 3. ROUTES AFTER THAT
const aiRoute = require("./routes/ai");
app.use("/ai", aiRoute);

// health
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// questions
app.post("/api/questions", async (req, res) => {
  const { idea, history = [] } = req.body || {};

  if (!idea || !String(idea).trim()) {
    return res.status(400).json({ error: "idea is required" });
  }

  try {
    const result = await generateNextQuestion({
      idea: String(idea).trim(),
      history: Array.isArray(history) ? history : [],
    });
    return res.json(result);
  } catch (error) {
    return res.json({
      question: {
        ...fallbackNextQuestion(String(idea).trim(), Array.isArray(history) ? history : []),
        id: (Array.isArray(history) ? history.length : 0) + 1,
      },
      source: "fallback",
      warning: formatQuestionWarning(error),
    });
  }
});

// sandbox
app.post("/run", async (req, res) => {
  const { projectPath } = req.body || {};

  if (!projectPath) {
    return res.status(400).json({ error: "projectPath is required" });
  }

  try {
    const result = await runSandbox(projectPath);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// generator
app.use("/generate", generateRoute);

// projects
const projectsRoute = require("./routes/projects");
app.use("/api/projects", projectsRoute);

const PORT = Number(process.env.PORT) || 5050;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
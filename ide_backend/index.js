const express = require("express");
const runSandbox = require("./sandbox");

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

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

const PORT = Number(process.env.PORT) || 5050;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

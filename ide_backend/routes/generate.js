const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "generated-app");

function createProjectFolder() {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }

  const existing = fs.readdirSync(BASE_DIR).filter(f => f.startsWith("project"));
  const nextId = existing.length + 1;

  const projectPath = path.join(BASE_DIR, `project${nextId}`);

  fs.mkdirSync(projectPath);
  fs.mkdirSync(path.join(projectPath, "frontend"));
  fs.mkdirSync(path.join(projectPath, "backend"));

  return projectPath;
}

function writeFiles(projectPath, data) {
  const frontendPath = path.join(projectPath, "frontend");
  const backendPath = path.join(projectPath, "backend");

  (data.frontend_files || []).forEach(f => {
    const fullPath = path.join(frontendPath, f.path);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, f.code);
  });

  (data.backend_files || []).forEach(f => {
    const fullPath = path.join(backendPath, f.path);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, f.code);
  });
}

router.post("/", (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Missing data" });
    }

    const projectPath = createProjectFolder();
    writeFiles(projectPath, data);

    res.json({ success: true, projectPath });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
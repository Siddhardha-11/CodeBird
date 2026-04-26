const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "generated-app");

function walkDir(dir, baseDir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== "node_modules" && file !== ".git") {
        walkDir(filePath, baseDir, fileList);
      }
    } else {
      let relativePath = path.relative(baseDir, filePath).replace(/\\/g, "/");
      // Read file content
      const content = fs.readFileSync(filePath, "utf8");
      fileList.push({ path: relativePath, content });
    }
  }
  return fileList;
}

// GET /api/projects
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(BASE_DIR)) {
      return res.json({ projects: [] });
    }

    const entries = fs.readdirSync(BASE_DIR, { withFileTypes: true });
    
    // Sort projects by natural number (project1, project2, project10)
    const projects = entries
      .filter((entry) => entry.isDirectory() && entry.name.match(/^project(\d+)$/i))
      .map((entry) => {
         const id = parseInt(entry.name.replace("project", ""));
         return { name: entry.name, id };
      })
      .sort((a, b) => b.id - a.id) // newest first
      .map(p => p.name);

    return res.json({ projects });
  } catch (err) {
    console.error("Error listing projects", err);
    return res.status(500).json({ error: "Failed to list projects" });
  }
});

// GET /api/projects/:name
router.get("/:name", (req, res) => {
  try {
    const { name } = req.params;
    if (!name.match(/^project(\d+)$/i)) {
      return res.status(400).json({ error: "Invalid project name" });
    }

    const projectPath = path.join(BASE_DIR, name);
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: "Project not found" });
    }

    const frontendFiles = walkDir(path.join(projectPath, "frontend"), path.join(projectPath, "frontend"));
    const backendFiles = walkDir(path.join(projectPath, "backend"), path.join(projectPath, "backend"));

    return res.json({ frontendFiles, backendFiles, projectPath });
  } catch (err) {
    console.error("Error loading project files", err);
    return res.status(500).json({ error: "Failed to load project files" });
  }
});

module.exports = router;

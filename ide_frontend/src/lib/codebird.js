const STORAGE_KEYS = {
  activeIdea: 'codebird.activeIdea',
  homeDraft: 'codebird.homeDraft',
  answers: 'codebird.answers',
};

const SANDBOX_API_URL = "http://localhost:5050";

/* =========================
   STORAGE
========================= */
function readStorage(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

/* =========================
   IDEA
========================= */
export function getSavedIdea() {
  return readStorage(STORAGE_KEYS.activeIdea, "My App");
}

export function saveIdea(idea) {
  writeStorage(STORAGE_KEYS.activeIdea, idea);
}

/* =========================
   ANSWERS
========================= */
export function getSavedAnswers() {
  return readStorage(STORAGE_KEYS.answers, { items: [] });
}

export function saveAnswers(answers) {
  writeStorage(STORAGE_KEYS.answers, answers);
}

/* =========================
   HOME DRAFT IDEA
========================= */
export function getHomeDraftIdea() {
  return readStorage(STORAGE_KEYS.homeDraft, '');
}

export function saveHomeDraftIdea(idea) {
  writeStorage(STORAGE_KEYS.homeDraft, idea);
}

export function clearHomeDraftIdea() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.homeDraft);
}

/* =========================
   WORKSPACE
========================= */
export function createWorkspace(idea = getSavedIdea(), answers = getSavedAnswers()) {
  return {
    projectName: "MyApp",
    idea,
    answers,
    files: {
      "frontend/index.js": `const http = require("http");

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>${String(idea).replace(/"/g, '&quot;')}</h1><p>Frontend running</p>");
});

server.listen(PORT, () => {
  console.log("Frontend running on http://localhost:" + PORT);
});
`,
      "frontend/package.json": `{
  "name": "frontend",
  "version": "1.0.0"
}
`,
      "backend/server.js": `const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(5001, () => {
  console.log("Backend running on http://localhost:5001");
});
`,
      "backend/package.json": `{
  "name": "backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  }
}
`
    }
  };
}

/* =========================
   GENERATE PROJECT
========================= */
export async function generateProjectFromWorkspace(workspace) {
  const frontend_files = Object.entries(workspace.files)
    .filter(([path]) => path.startsWith("frontend/"))
    .map(([path, code]) => ({
      path: path.replace("frontend/", ""),
      code,
    }));

  const backend_files = Object.entries(workspace.files)
    .filter(([path]) => path.startsWith("backend/"))
    .map(([path, code]) => ({
      path: path.replace("backend/", ""),
      code,
    }));

  const response = await fetch(`${SANDBOX_API_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      data: { frontend_files, backend_files }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate project");
  }

  return data;
}

/* =========================
   QUESTIONS API
========================= */
export async function generateNextQuestion(idea, history = []) {
  const response = await fetch(`${SANDBOX_API_URL}/api/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ idea, history })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate question");
  }

  return data;
}

/* =========================
   SANDBOX
========================= */
export async function startSandbox(projectPath) {
  const response = await fetch(`${SANDBOX_API_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ projectPath })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to run sandbox");
  }

  return data;
}

/* =========================
   AI GENERATION (OPTIONAL)
========================= */
export async function generateWithAI(idea) {
  const response = await fetch(`${SANDBOX_API_URL}/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ idea })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate with AI");
  }

  return data.files || data.result || data;
}

/* =========================
   PROJECT HISTORY
========================= */
export async function fetchProjects() {
  const response = await fetch(`${SANDBOX_API_URL}/api/projects`);
  const data = await response.json().catch(() => ({ projects: [] }));
  return data.projects || [];
}

export async function fetchProjectData(projectName) {
  const response = await fetch(`${SANDBOX_API_URL}/api/projects/${projectName}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch project");
  }
  return data;
}
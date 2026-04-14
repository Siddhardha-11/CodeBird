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
  const value = localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
   WORKSPACE (VERY IMPORTANT)
========================= */
export function createWorkspace(idea, answers) {
  return {
    projectName: "MyApp",
    idea,
    files: {
      "frontend/index.js": `export default function App(){return <h1>${idea}</h1>}`,
      "backend/server.js": `console.log("Backend running");`
    }
  };
}
/* =========================
   HOME DRAFT IDEA (FIX)
========================= */

export function getHomeDraftIdea() {
  const value = localStorage.getItem('codebird.homeDraft');
  return value || '';
}

export function saveHomeDraftIdea(idea) {
  localStorage.setItem('codebird.homeDraft', idea);
}

export function clearHomeDraftIdea() {
  localStorage.removeItem('codebird.homeDraft');
}

/* =========================
   GENERATE PROJECT
========================= */
export async function generateProjectFromWorkspace(workspace) {
  const frontend_files = Object.entries(workspace.files)
    .filter(([path]) => !path.startsWith("backend"))
    .map(([path, code]) => ({ path, code }));

  const backend_files = Object.entries(workspace.files)
    .filter(([path]) => path.startsWith("backend"))
    .map(([path, code]) => ({
      path: path.replace("backend/", ""),
      code
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

  const data = await response.json();

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

  const data = await response.json();

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to run sandbox");
  }

  return data;
}
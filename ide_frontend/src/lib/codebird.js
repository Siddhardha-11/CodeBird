const STORAGE_KEYS = {
  activeIdea: 'codebird.activeIdea',
  homeDraft: 'codebird.homeDraft',
  answers: 'codebird.answers',
};
const SANDBOX_API_URL = 'http://localhost:5050';

const DEFAULT_IDEA =
  'A simple AI-assisted app builder that turns a plain-language idea into code, questions, and a live workspace.';

const DEFAULT_ANSWERS = {
  items: [
    {
      id: 1,
      field: 'primaryGoal',
      text: 'What is the main goal of this app?',
      answer: 'Simple website',
    },
    {
      id: 2,
      field: 'primaryUsers',
      text: 'Who will use this app most often?',
      answer: 'Public users',
    },
    {
      id: 3,
      field: 'devicePriority',
      text: 'Where should this app work best?',
      answer: 'All devices',
    },
  ],
};

const TITLE_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'app',
  'application',
  'build',
  'create',
  'for',
  'help',
  'i',
  'idea',
  'make',
  'my',
  'of',
  'personal',
  'simple',
  'the',
  'to',
  'want',
  'web',
  'website',
]);

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorage(key, fallback) {
  if (!canUseStorage()) {
    return fallback;
  }

  const value = window.localStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function titleCase(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function inferProjectName(idea) {
  const words = idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !TITLE_STOP_WORDS.has(word));

  if (!words.length) {
    return 'CodeBird Studio';
  }

  return titleCase(words.slice(0, 3).join(' '));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeAnswers(rawAnswers) {
  if (Array.isArray(rawAnswers?.items)) {
    return rawAnswers.items.filter((item) => item?.answer);
  }

  return Object.entries(rawAnswers || {})
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      id: Number(key),
      field: `question_${key}`,
      text: `Question ${key}`,
      answer: value,
    }));
}

function answerAt(items, index, fallback) {
  return items[index]?.answer || fallback;
}

function buildHighlights(idea, answers) {
  const items = normalizeAnswers(answers);

  return [
    `Built around ${answerAt(items, 0, 'your chosen flow').toLowerCase()}.`,
    `Shaped for ${answerAt(items, 1, 'your main users')}.`,
    `Optimized with ${answerAt(items, 2, 'your priorities')} in mind.`,
    `Core concept: ${idea}.`,
  ];
}

function buildFeatures(answers) {
  const items = normalizeAnswers(answers);

  return [
    ...items.slice(0, 3).map((item) => `${item.text} Answer selected: ${item.answer}.`),
    'Generated starter files, milestones, and preview notes.',
  ].slice(0, 4);
}

function createFileContent(projectName, idea, answers) {
  const appSlug = slugify(projectName);
  const items = normalizeAnswers(answers);
  const first = items[0] || { text: 'Primary direction', answer: 'Starter app flow' };
  const second = items[1] || { text: 'Target users', answer: 'General users' };
  const third = items[2] || { text: 'Priority focus', answer: 'Usable on all devices' };

  return [
    {
      path: 'src/App.jsx',
      language: 'jsx',
      content: `export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <span className="eyebrow">CodeBird Generated Prototype</span>
        <h1>${projectName}</h1>
        <p>${idea}</p>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>${first.text.replace(/"/g, '\\"')}</h2>
          <p>${first.answer.replace(/"/g, '\\"')}</p>
        </article>
        <article className="panel">
          <h2>${second.text.replace(/"/g, '\\"')}</h2>
          <p>${second.answer.replace(/"/g, '\\"')}</p>
        </article>
        <article className="panel">
          <h2>${third.text.replace(/"/g, '\\"')}</h2>
          <p>${third.answer.replace(/"/g, '\\"')}</p>
        </article>
      </section>
    </main>
  );
}`,
    },
    {
      path: 'src/pages/Home.jsx',
      language: 'jsx',
      content: `const highlights = ${JSON.stringify(buildHighlights(idea, answers), null, 2)};

export default function Home() {
  return (
    <div className="page">
      <header className="hero">
        <span className="badge">${projectName}</span>
        <h1>Launch your first version faster</h1>
        <p>${idea}</p>
      </header>

      <section className="highlights">
        {highlights.map((item) => (
          <div key={item} className="highlight-card">
            {item}
          </div>
        ))}
      </section>
    </div>
  );
}`,
    },
    {
      path: 'src/components/IdeaForm.jsx',
      language: 'jsx',
      content: `export function IdeaForm() {
  return (
    <form className="idea-form">
      <label htmlFor="idea">Describe what you want to build</label>
      <textarea
        id="idea"
        rows="6"
        defaultValue="${idea.replace(/"/g, '\\"')}"
      />
      <button type="submit">Generate app plan</button>
    </form>
  );
}`,
    },
    {
      path: 'src/styles/app.css',
      language: 'css',
      content: `:root {
  color-scheme: dark;
  --bg: #08111f;
  --panel: rgba(15, 23, 42, 0.92);
  --border: rgba(148, 163, 184, 0.18);
  --text: #e2e8f0;
  --muted: #94a3b8;
  --accent: #38bdf8;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.2), transparent 35%),
    linear-gradient(180deg, #08111f 0%, #020617 100%);
  color: var(--text);
  font-family: 'Segoe UI', sans-serif;
}

.hero-card,
.panel,
.highlight-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 24px;
}`,
    },
    {
      path: 'backend/server.js',
      language: 'js',
      content: `const express = require("express");

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 5000;

app.get("/api/health", (req, res) => {
  res.json({ ok: true, project: "${appSlug}" });
});

app.post("/api/generate", (req, res) => {
  const { idea } = req.body;
  res.json({
    projectName: "${projectName}",
    message: "Starter app generated successfully.",
    idea,
  });
});

app.listen(PORT, () => {
  console.log(\`Backend running on http://localhost:\${PORT}\`);
});`,
    },
  ];
}

export async function startSandbox(projectPath) {
  const response = await fetch(`${SANDBOX_API_URL}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectPath }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to start sandbox.');
  }

  return data;
}

export async function generateNextQuestion(idea, history = []) {
  const response = await fetch(`${SANDBOX_API_URL}/api/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idea, history }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate questions.');
  }

  if (!data.question) {
    throw new Error('No question was generated.');
  }

  return data;
}

export function getSavedIdea() {
  return readStorage(STORAGE_KEYS.activeIdea, DEFAULT_IDEA);
}

export function saveIdea(idea) {
  writeStorage(STORAGE_KEYS.activeIdea, idea);
}

export function getHomeDraftIdea() {
  return readStorage(STORAGE_KEYS.homeDraft, '');
}

export function saveHomeDraftIdea(idea) {
  writeStorage(STORAGE_KEYS.homeDraft, idea);
}

export function clearHomeDraftIdea() {
  writeStorage(STORAGE_KEYS.homeDraft, '');
}

export function getSavedAnswers() {
  return readStorage(STORAGE_KEYS.answers, DEFAULT_ANSWERS);
}

export function saveAnswers(answers) {
  writeStorage(STORAGE_KEYS.answers, answers);
}

export function createWorkspace(idea = getSavedIdea(), answers = getSavedAnswers()) {
  const safeIdea = idea || DEFAULT_IDEA;
  const safeAnswers = Array.isArray(answers?.items) ? answers : DEFAULT_ANSWERS;
  const normalizedAnswers = normalizeAnswers(safeAnswers);
  const projectName = inferProjectName(safeIdea);
  const files = createFileContent(projectName, safeIdea, safeAnswers);

  return {
    projectName,
    sandboxProjectPath: 'generated-app/project_1',
    branchName: 'ai-draft',
    appType: answerAt(normalizedAnswers, 0, 'Starter app'),
    audience: answerAt(normalizedAnswers, 1, 'General users'),
    device: answerAt(normalizedAnswers, 2, 'All devices'),
    idea: safeIdea,
    stack: ['React', 'Tailwind CSS', 'Express API'],
    milestones: [
      'Capture a product idea in plain language.',
      'Refine the app through short multiple-choice questions.',
      'Generate starter code, structure, and preview notes.',
      'Move into an editable workspace for iteration.',
    ],
    features: buildFeatures(safeAnswers),
    files,
  };
}

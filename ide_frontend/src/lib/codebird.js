const STORAGE_KEYS = {
  idea: 'codebird.idea',
  answers: 'codebird.answers',
};

const DEFAULT_IDEA =
  'A simple AI-assisted app builder that turns a plain-language idea into code, questions, and a live workspace.';

const DEFAULT_ANSWERS = {
  1: 'Simple website',
  2: 'Public users',
  3: 'All devices',
};

const TITLE_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'app',
  'for',
  'my',
  'of',
  'simple',
  'the',
  'to',
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

  return titleCase(words.slice(0, 2).join(' '));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildHighlights(idea, answers) {
  return [
    `Built around ${answers[1] || DEFAULT_ANSWERS[1].toLowerCase()}.`,
    `Primary audience: ${answers[2] || DEFAULT_ANSWERS[2]}.`,
    `Optimized for ${answers[3] || DEFAULT_ANSWERS[3].toLowerCase()}.`,
    `Core concept: ${idea}.`,
  ];
}

function buildFeatures(answers) {
  const appType = answers[1] || DEFAULT_ANSWERS[1];
  const audience = answers[2] || DEFAULT_ANSWERS[2];
  const device = answers[3] || DEFAULT_ANSWERS[3];

  return [
    `Idea capture and guided setup for a ${appType.toLowerCase()}.`,
    `AI workspace tuned for ${audience.toLowerCase()}.`,
    `Responsive screens designed for ${device.toLowerCase()}.`,
    'Generated starter files, milestones, and preview notes.',
  ];
}

function createFileContent(projectName, idea, answers) {
  const appSlug = slugify(projectName);
  const audience = answers[2] || DEFAULT_ANSWERS[2];
  const appType = answers[1] || DEFAULT_ANSWERS[1];
  const device = answers[3] || DEFAULT_ANSWERS[3];

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
          <h2>Audience</h2>
          <p>${audience}</p>
        </article>
        <article className="panel">
          <h2>App Type</h2>
          <p>${appType}</p>
        </article>
        <article className="panel">
          <h2>Best On</h2>
          <p>${device}</p>
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

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});`,
    },
  ];
}

export function getSavedIdea() {
  return readStorage(STORAGE_KEYS.idea, DEFAULT_IDEA);
}

export function saveIdea(idea) {
  writeStorage(STORAGE_KEYS.idea, idea);
}

export function getSavedAnswers() {
  return readStorage(STORAGE_KEYS.answers, DEFAULT_ANSWERS);
}

export function saveAnswers(answers) {
  writeStorage(STORAGE_KEYS.answers, answers);
}

export function createWorkspace(idea = getSavedIdea(), answers = getSavedAnswers()) {
  const safeIdea = idea || DEFAULT_IDEA;
  const safeAnswers = { ...DEFAULT_ANSWERS, ...answers };
  const projectName = inferProjectName(safeIdea);
  const files = createFileContent(projectName, safeIdea, safeAnswers);

  return {
    projectName,
    branchName: 'ai-draft',
    appType: safeAnswers[1],
    audience: safeAnswers[2],
    device: safeAnswers[3],
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

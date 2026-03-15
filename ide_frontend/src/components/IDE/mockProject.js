function escapeForTemplate(value) {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function createNode(path, type, children = []) {
  const segments = path.split('/');
  return {
    id: path,
    path,
    name: segments[segments.length - 1],
    type,
    children,
  };
}

export function buildInitialProject(workspace) {
  const safeIdea = escapeForTemplate(workspace.idea || 'AI-generated starter application');
  const safeName = escapeForTemplate(workspace.projectName || 'CodeBird Studio');

  const files = {
    'src/App.jsx': `import Home from './pages/Home';

export default function App() {
  return <Home />;
}
`,
    'src/pages/Home.jsx': `import HeroCard from '../components/HeroCard';
import FeatureGrid from '../components/FeatureGrid';
import '../styles.css';

const features = [
  'Prompt-driven project generation',
  'Visual IDE workspace with live preview',
  'Fast edits for non-technical builders',
];

export default function Home() {
  return (
    <main className="app-shell">
      <HeroCard />
      <FeatureGrid items={features} />
    </main>
  );
}
`,
    'src/components/HeroCard.jsx': `export default function HeroCard() {
  return (
    <section className="hero-card">
      <span className="eyebrow">CodeBird Generated App</span>
      <h1>${safeName}</h1>
      <p>${safeIdea}</p>
      <button type="button">Continue building</button>
    </section>
  );
}
`,
    'src/components/FeatureGrid.jsx': `export default function FeatureGrid({ items }) {
  return (
    <section className="feature-grid">
      {items.map((item) => (
        <article key={item} className="feature-card">
          <h2>{item}</h2>
          <p>Editable starter content generated inside the IDE.</p>
        </article>
      ))}
    </section>
  );
}
`,
    'src/styles.css': `:root {
  color-scheme: dark;
  --bg: #020617;
  --panel: rgba(15, 23, 42, 0.88);
  --border: rgba(148, 163, 184, 0.18);
  --text: #e2e8f0;
  --muted: #94a3b8;
  --accent: #38bdf8;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.15), transparent 32%),
    linear-gradient(180deg, #081120 0%, #020617 100%);
  color: var(--text);
}

.app-shell {
  min-height: 100vh;
  padding: 48px 20px 72px;
}

.hero-card {
  max-width: 920px;
  margin: 0 auto 24px;
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: 28px;
  background: var(--panel);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.45);
}

.hero-card h1 {
  margin: 12px 0;
  font-size: clamp(2rem, 4vw, 4rem);
}

.hero-card p {
  color: var(--muted);
  line-height: 1.7;
  max-width: 60ch;
}

.hero-card button {
  margin-top: 18px;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #38bdf8, #67e8f9);
  color: #082f49;
  font-weight: 700;
}

.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #7dd3fc;
}

.feature-grid {
  max-width: 920px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.feature-card {
  padding: 20px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.85);
}

.feature-card h2 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.feature-card p {
  margin: 0;
  color: var(--muted);
}
`,
    'public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeName}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
    'package.json': `{
  "name": "${workspace.projectName.toLowerCase().replace(/\s+/g, '-')}",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
`,
    'preview/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName} Preview</title>
    <style>
      body {
        margin: 0;
        font-family: 'Segoe UI', sans-serif;
        background:
          radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 30%),
          linear-gradient(180deg, #081120 0%, #020617 100%);
        color: #e2e8f0;
      }

      .shell {
        min-height: 100vh;
        padding: 40px 18px;
      }

      .hero {
        max-width: 920px;
        margin: 0 auto 18px;
        padding: 28px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 24px;
        background: rgba(15, 23, 42, 0.88);
      }

      .eyebrow {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.28em;
        color: #67e8f9;
      }

      h1 {
        margin: 12px 0 10px;
        font-size: clamp(32px, 5vw, 58px);
      }

      p {
        color: #94a3b8;
        line-height: 1.7;
      }

      .grid {
        max-width: 920px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .card {
        padding: 18px;
        border-radius: 20px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(15, 23, 42, 0.85);
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <span class="eyebrow">AI Workspace Preview</span>
        <h1>${safeName}</h1>
        <p>${safeIdea}</p>
      </section>
      <section class="grid">
        <article class="card">
          <h2>Prompt to project</h2>
          <p>The project begins with voice or text, then turns into editable code.</p>
        </article>
        <article class="card">
          <h2>IDE editing</h2>
          <p>Users can open files, tweak the generated code, and iterate visually.</p>
        </article>
        <article class="card">
          <h2>Live preview</h2>
          <p>This iframe acts as the preview area your teammate can wire up further.</p>
        </article>
      </section>
    </main>
  </body>
</html>
`,
  };

  const tree = [
    createNode('src', 'folder', [
      createNode('src/components', 'folder', [
        createNode('src/components/HeroCard.jsx', 'file'),
        createNode('src/components/FeatureGrid.jsx', 'file'),
      ]),
      createNode('src/pages', 'folder', [createNode('src/pages/Home.jsx', 'file')]),
      createNode('src/App.jsx', 'file'),
      createNode('src/styles.css', 'file'),
    ]),
    createNode('public', 'folder', [createNode('public/index.html', 'file')]),
    createNode('preview', 'folder', [createNode('preview/index.html', 'file')]),
    createNode('package.json', 'file'),
  ];

  return { tree, files };
}

export function createPreviewDocument(files, workspace) {
  return (
    files['preview/index.html'] ||
    `<!DOCTYPE html><html><body><h1>${workspace.projectName}</h1><p>${workspace.idea}</p></body></html>`
  );
}

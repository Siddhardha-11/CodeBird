const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "..", "generated-app");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getNextProjectPath() {
  ensureDir(BASE_DIR);

  const entries = fs.readdirSync(BASE_DIR, { withFileTypes: true });

  let maxId = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const match = entry.name.match(/^project(\d+)$/i);
    if (!match) continue;

    const id = Number(match[1]);
    if (!Number.isNaN(id) && id > maxId) {
      maxId = id;
    }
  }

  const nextId = maxId + 1;
  return path.join(BASE_DIR, `project${nextId}`);
}

function createProjectFolder() {
  const projectPath = getNextProjectPath();
  ensureDir(projectPath);
  ensureDir(path.join(projectPath, "frontend"));
  ensureDir(path.join(projectPath, "backend"));
  return projectPath;
}

function isInsideBase(baseDir, targetPath) {
  const normalizedBase = path.normalize(baseDir + path.sep);
  const normalizedTarget = path.normalize(targetPath);
  return normalizedTarget.startsWith(normalizedBase);
}

function writeTextFile(fullPath, content) {
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, "utf8");
}

function createStableFrontendServerCode() {
  return `
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3001;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}

function safeResolve(urlPath) {
  const cleanPath = decodeURIComponent((urlPath || "/").split("?")[0]);
  const relativePath = cleanPath === "/" ? "/index.html" : cleanPath;
  const resolvedPath = path.normalize(path.join(ROOT_DIR, relativePath));

  if (!resolvedPath.startsWith(path.normalize(ROOT_DIR + path.sep))) {
    return null;
  }

  return resolvedPath;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    return send(res, 400, "Bad Request");
  }

  const filePath = safeResolve(req.url);

  if (!filePath) {
    return send(res, 403, "Forbidden");
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      return send(
        res,
        404,
        \`<html><body style="font-family:sans-serif;padding:24px">
          <h1>404 - File Not Found</h1>
          <p>\${req.url}</p>
        </body></html>\`,
        "text/html; charset=utf-8"
      );
    }

    const actualPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;

    fs.readFile(actualPath, (readErr, data) => {
      if (readErr) {
        return send(
          res,
          404,
          \`<html><body style="font-family:sans-serif;padding:24px">
            <h1>404 - File Not Found</h1>
            <p>\${req.url}</p>
          </body></html>\`,
          "text/html; charset=utf-8"
        );
      }

      return send(res, 200, data, getContentType(actualPath));
    });
  });
});

server.listen(PORT, () => {
  console.log("Frontend running on http://localhost:" + PORT);
});
`.trimStart();
}

function writeFiles(projectPath, data) {
  const frontendPath = path.join(projectPath, "frontend");
  const backendPath = path.join(projectPath, "backend");

  const frontendFiles = Array.isArray(data.frontend_files) ? data.frontend_files : [];
  const backendFiles = Array.isArray(data.backend_files) ? data.backend_files : [];

  for (const file of frontendFiles) {
    if (!file || typeof file.path !== "string") continue;

    const fullPath = path.join(frontendPath, file.path);
    if (!isInsideBase(frontendPath, fullPath)) {
      throw new Error(`Unsafe frontend path: ${file.path}`);
    }

    writeTextFile(fullPath, file.code ?? "");
  }

  for (const file of backendFiles) {
    if (!file || typeof file.path !== "string") continue;

    const fullPath = path.join(backendPath, file.path);
    if (!isInsideBase(backendPath, fullPath)) {
      throw new Error(`Unsafe backend path: ${file.path}`);
    }

    writeTextFile(fullPath, file.code ?? "");
  }

  // Always inject a stable frontend server so generated apps start reliably.
  writeTextFile(path.join(frontendPath, "server.js"), createStableFrontendServerCode());
}

router.post("/", (req, res) => {
  try {
    const { data } = req.body || {};

    if (!data) {
      return res.status(400).json({ error: "Missing data" });
    }

    const projectPath = createProjectFolder();
    writeFiles(projectPath, data);

    return res.json({ success: true, projectPath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to generate project" });
  }
});

module.exports = router;
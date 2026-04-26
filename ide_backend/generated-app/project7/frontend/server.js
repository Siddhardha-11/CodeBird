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
        `<html><body style="font-family:sans-serif;padding:24px">
          <h1>404 - File Not Found</h1>
          <p>${req.url}</p>
        </body></html>`,
        "text/html; charset=utf-8"
      );
    }

    const actualPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;

    fs.readFile(actualPath, (readErr, data) => {
      if (readErr) {
        return send(
          res,
          404,
          `<html><body style="font-family:sans-serif;padding:24px">
            <h1>404 - File Not Found</h1>
            <p>${req.url}</p>
          </body></html>`,
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

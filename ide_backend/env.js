const fs = require("fs");
const path = require("path");

function parseEnvLine(line) {
  let trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  if (trimmed.startsWith("export ")) {
    trimmed = trimmed.slice(7).trim();
  }

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (!key) {
    return null;
  }

  // Remove surrounding quotes if present
  const startsWithDouble = value.startsWith('"') && value.endsWith('"');
  const startsWithSingle = value.startsWith("'") && value.endsWith("'");

  if ((startsWithDouble || startsWithSingle) && value.length >= 2) {
    value = value.slice(1, -1);
  }

  // Unescape common sequences
  value = value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");

  return { key, value };
}

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");

  for (const line of content.split(/\r?\n/)) {
    const entry = parseEnvLine(line);
    if (!entry) {
      continue;
    }

    if (process.env[entry.key] === undefined) {
      process.env[entry.key] = entry.value;
    }
  }
}

module.exports = loadEnvFile;

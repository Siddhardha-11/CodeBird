const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const SANDBOX_BACKEND_PORT = 5001;
const SANDBOX_FRONTEND_PORT = 3001;

function runCommand(command, cwd, label) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { cwd });

    child.stdout.on("data", (data) => {
      console.log(`[${label}] ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`[${label} ERROR] ${data}`);
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed`));
    });
  });
}

function startDetached(command, cwd, label) {
  const child = exec(command, { cwd });

  child.stdout.on("data", (data) => {
    console.log(`[${label}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`[${label} ERROR] ${data}`);
  });

  return child.pid;
}

// 🔥 THIS IS THE FUNCTION YOUR BACKEND EXPECTS
async function runSandbox(projectPath) {
  if (!projectPath) {
    throw new Error("No projectPath provided");
  }

  const backendPath = path.join(projectPath, "backend");
  const frontendPath = path.join(projectPath, "frontend");

  const result = {
    backend: null,
    frontend: null,
  };

  if (!fs.existsSync(projectPath)) {
    throw new Error("Project folder not found");
  }

  // Backend
  if (fs.existsSync(backendPath)) {
    await runCommand("npm install", backendPath, "Backend Install");

    const backendPid = startDetached(
      "node server.js",
      backendPath,
      "Backend"
    );

    result.backend = {
      pid: backendPid,
      url: `http://localhost:${SANDBOX_BACKEND_PORT}`,
    };
  }

  // Frontend
  if (fs.existsSync(frontendPath)) {
    await runCommand("npm install", frontendPath, "Frontend Install");

    const frontendPid = startDetached(
      "node index.js",
      frontendPath,
      "Frontend"
    );

    result.frontend = {
      pid: frontendPid,
      url: `http://localhost:${SANDBOX_FRONTEND_PORT}`,
    };
  }

  return result;
}

// 🔥 CRITICAL FIX
module.exports = runSandbox;
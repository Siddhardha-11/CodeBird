const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const SANDBOX_BACKEND_PORT = 5001;
const SANDBOX_FRONTEND_PORT = 3001;

function runCommand(command, cwd, label) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { cwd });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data;
      console.log(`[${label}] ${data}`.trimEnd());
    });

    child.stderr.on("data", (data) => {
      stderr += data;
      console.error(`[${label} ERROR] ${data}`.trimEnd());
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${label} failed with code ${code}`));
      }
    });
  });
}

function startDetached(command, cwd, label) {
  const child = exec(command, { cwd });

  child.stdout.on("data", (data) => {
    console.log(`[${label}] ${data}`.trimEnd());
  });

  child.stderr.on("data", (data) => {
    console.error(`[${label} ERROR] ${data}`.trimEnd());
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`[${label} ERROR] exited with code ${code}`);
    }
  });

  return child.pid;
}

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

  if (fs.existsSync(backendPath)) {
    await runCommand("npm install", backendPath, "Backend Install");

    const backendPid = startDetached(
      `node -e "process.env.PORT=${SANDBOX_BACKEND_PORT}; require('./server.js')"`,
      backendPath,
      "Backend"
    );

    result.backend = {
      path: backendPath,
      pid: backendPid,
      url: `http://localhost:${SANDBOX_BACKEND_PORT}`,
    };
  }

  if (fs.existsSync(frontendPath)) {
    await runCommand("npm install", frontendPath, "Frontend Install");

    const frontendPid = startDetached(
      `node -e "process.env.PORT=${SANDBOX_FRONTEND_PORT}; require('./server.js')"`,
      frontendPath,
      "Frontend"
    );

    result.frontend = {
      path: frontendPath,
      pid: frontendPid,
      url: `http://localhost:${SANDBOX_FRONTEND_PORT}`,
    };
  }

  if (!result.backend && !result.frontend) {
    throw new Error("No frontend or backend folder found in the provided project path.");
  }

  return result;
}

module.exports = runSandbox;
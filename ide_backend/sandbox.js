const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

let activePids = [];

function killActiveProcesses() {
  for (const pid of activePids) {
    try {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        execSync(`taskkill /pid ${pid} /T /F`);
      } else {
        process.kill(-pid, 'SIGKILL');
      }
    } catch (e) {
      // Process might already be dead
    }
  }
  activePids = [];
}

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
  const child = exec(command, { cwd, detached: process.platform !== 'win32' });

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

  activePids.push(child.pid);
  return child.pid;
}

function getRandomPort() {
  return Math.floor(Math.random() * (40000 - 10000 + 1)) + 10000;
}

async function runSandbox(projectPath) {
  if (!projectPath) {
    throw new Error("No projectPath provided");
  }

  // Kill any previous sandbox processes
  killActiveProcesses();

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
    
    const port = getRandomPort();
    const backendPid = startDetached(
      `node -e "process.env.PORT=${port}; require('./server.js')"`,
      backendPath,
      "Backend"
    );

    result.backend = {
      path: backendPath,
      pid: backendPid,
      url: `http://localhost:${port}`,
    };
  }

  if (fs.existsSync(frontendPath)) {
    await runCommand("npm install", frontendPath, "Frontend Install");

    const port = getRandomPort();
    const frontendPid = startDetached(
      `node -e "process.env.PORT=${port}; require('./server.js')"`,
      frontendPath,
      "Frontend"
    );

    result.frontend = {
      path: frontendPath,
      pid: frontendPid,
      url: `http://localhost:${port}`,
    };
  }

  if (!result.backend && !result.frontend) {
    throw new Error("No frontend or backend folder found in the provided project path.");
  }

  return result;
}

module.exports = runSandbox;
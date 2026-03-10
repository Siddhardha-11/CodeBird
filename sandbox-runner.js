const { exec } = require("child_process");
const fs = require("fs");

function runCommand(command, cwd, label) {
  return new Promise((resolve, reject) => {

    const process = exec(command, { cwd });

    process.stdout.on("data", (data) => {
      console.log(`[${label}] ${data}`);
    });

    process.stderr.on("data", (data) => {
      console.error(`[${label} ERROR] ${data}`);
    });

    process.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with code ${code}`));
    });

  });
}

function openBrowser(url) {
  exec(`start ${url}`);   // Windows command
}

async function runSandbox(projectPath) {

  console.log("Starting sandbox for:", projectPath);

  const backendPath = `${projectPath}/backend`;
  const frontendPath = `${projectPath}/frontend`;

  try {

    /* BACKEND */

    if (fs.existsSync(backendPath)) {

      console.log("Installing backend dependencies...");
      await runCommand("npm install", backendPath, "Backend Install");

      console.log("Starting backend server...");
      exec("node server.js", { cwd: backendPath });

    }

    /* FRONTEND */

    if (fs.existsSync(frontendPath)) {

      console.log("Installing frontend dependencies...");
      await runCommand("npm install", frontendPath, "Frontend Install");

      console.log("Starting frontend...");
      exec("npm start", { cwd: frontendPath });

      console.log("Preview URL:");
      console.log("http://localhost:3000");

      // open browser automatically
      setTimeout(() => {
        openBrowser("http://localhost:3000");
      }, 3000);

    }

  } catch (err) {
    console.error("Sandbox error:", err.message);
  }

}

runSandbox("./generated-app/project_1");
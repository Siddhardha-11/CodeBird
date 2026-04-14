const http = require("http");

const PORT = 3001; // 🔥 FORCE CORRECT PORT

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Hello from Generated Frontend!</h1>");
});

server.listen(PORT, () => {
  console.log(`Frontend running on http://localhost:${PORT}`);
});
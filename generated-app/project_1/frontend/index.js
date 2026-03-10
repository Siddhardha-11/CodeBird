const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Hello from Generated Frontend!</h1>");
});

server.listen(3000, () => {
  console.log("Frontend running on http://localhost:3000");
});
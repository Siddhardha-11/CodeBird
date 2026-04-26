# This backend server is intentionally left minimal to focus on the frontend.
# In a real application, this would handle API requests for tasks.

const http = require('http');
const port = 5001;

const server = http.createServer((req, res) => {
    // Basic acknowledgement that the backend server is running
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        message: "Backend API is running.",
        status: "ok",
        timestamp: new Date().toISOString()
    }));
});

server.listen(port, () => {
    console.log(`Backend API server running on http://localhost:${port}`);
});

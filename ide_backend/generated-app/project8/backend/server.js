# This backend is not used by the frontend for this specific application.
# The frontend uses localStorage for persistence.
# This serves as a placeholder or for potential future API integration.

const http = require('http');
const port = 5001;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'SaaS To-Do API - Not Used by Frontend' }));
});

server.listen(port, () => {
    console.log(`Backend API server running on http://localhost:${port}`);
});

const http = require('http');
const data = JSON.stringify({ idea: 'I want a task manager app for small team' });
const options = {
  hostname: 'localhost',
  port: 5050,
  path: '/api/generate-questions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log('body', body);
  });
});
req.on('error', (err) => console.error('request error', err));
req.write(data);
req.end();

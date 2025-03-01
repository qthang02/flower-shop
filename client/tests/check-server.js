const http = require('http');
const { BASE_URL } = require('./config');

// Extract hostname and port from BASE_URL
const url = new URL(BASE_URL);
const hostname = url.hostname;
const port = url.port || (url.protocol === 'https:' ? 443 : 80);

console.log(`Checking if server is running at ${hostname}:${port}...`);

const req = http.request({
  hostname: hostname,
  port: port,
  path: '/',
  method: 'GET',
  timeout: 5000
}, (res) => {
  console.log(`Server is running! Status code: ${res.statusCode}`);
  res.on('data', () => {});
  res.on('end', () => {
    console.log('Response received successfully');
  });
});

req.on('error', (e) => {
  console.error(`Server check failed: ${e.message}`);
  if (e.code === 'ECONNREFUSED') {
    console.error(`Could not connect to ${hostname}:${port}. Make sure your application is running.`);
  }
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

req.end();

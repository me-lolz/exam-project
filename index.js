// Vercel entry point fix
const { createServer } = require('http');
const { readFileSync } = require('fs');
const { join } = require('path');

const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const html = readFileSync(join(__dirname, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(html);
  }
  
  if (req.url === '/style.css') {
    const css = readFileSync(join(__dirname, 'style.css'));
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(css);
  }
  
  if (req.url === '/script.js') {
    const js = readFileSync(join(__dirname, 'script.js'));
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    return res.end(js);
  }
  
  res.writeHead(404);
  res.end('Not found');
});

module.exports = server;
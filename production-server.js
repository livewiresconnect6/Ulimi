#!/usr/bin/env node

// Production server wrapper that handles proper port binding
// Fixes the "address already in use" error in deployed environment

import { createServer } from 'http';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Production-safe port handling
const port = process.env.PORT || process.env.REPL_ID ? 5000 : 3000;
const host = process.env.HOST || '0.0.0.0';

console.log(`Starting production server on ${host}:${port}`);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
const publicDir = resolve(__dirname, 'public');
if (existsSync(publicDir)) {
  app.use(express.static(publicDir));
  console.log(`Serving static files from: ${publicDir}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port, timestamp: new Date().toISOString() });
});

// API routes placeholder (if you have them)
app.use('/api', (req, res) => {
  res.json({ message: 'API endpoint - add your routes here' });
});

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  const indexPath = resolve(publicDir, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Static files not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server with proper error handling
const server = createServer(app);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying alternative port...`);
    const altPort = port + Math.floor(Math.random() * 1000);
    server.listen(altPort, host, () => {
      console.log(`Server running on http://${host}:${altPort}`);
    });
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

server.listen(port, host, () => {
  console.log(`✅ Production server running on http://${host}:${port}`);
});
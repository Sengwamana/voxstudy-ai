// backend/server.js
const config = require('./config/config');
const express = require('express');
const path = require('path');
const cors = require('cors');

// Robust Environment Polyfills
if (!globalThis.fetch) {
  try {
    const fetch = require('node-fetch');
    globalThis.fetch = fetch;
    globalThis.Headers = fetch.Headers;
    globalThis.Request = fetch.Request;
    globalThis.Response = fetch.Response;
  } catch (err) {
    console.error("Warning: node-fetch not found. Install it for Node < 18.");
  }
}

// Polyfill AbortController for older Node versions if missing
if (!globalThis.AbortController) {
  try {
    globalThis.AbortController = require('abort-controller');
  } catch (err) {
    // Ignore if not installed, but might cause timeouts to fail silently in very old node
  }
}

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Request Logging Middleware - Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Static File Serving (Production)
const distPath = path.join(__dirname, '../dist');

if (config.env === 'production') {
  app.use(express.static(distPath));

  // SPA Fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development Fallback
  app.get('/', (req, res) => {
    res.send(`VoxStudy Backend Running (Env: ${config.env}). Use Vite frontend for development.`);
  });
}

// Start Server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 VoxStudy Server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.env}`);
});
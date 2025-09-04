#!/usr/bin/env node
require('dotenv').config();

const path = require('path');
const express = require('express');

// Import utilities and middleware
const { corsMiddleware } = require('./middleware/cors');
const { readJsonSafe } = require('./utils/files');

// Import route modules
const healthRoutes = require('./routes/health');
const configRoutes = require('./routes/config');
const brandPackRoutes = require('./routes/brand-packs');
const layoutRoutes = require('./routes/layout');
const designRoutes = require('./routes/design');
const semanticRoutes = require('./routes/semantic');

const PORT = process.env.PORT || 8901;

async function main() {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(corsMiddleware);
  
  const pkg = readJsonSafe(path.join(process.cwd(), 'package.json')) || { version: '0.0.0' };
  console.log(`Starting Agentic Design API Server v${pkg.version} on port ${PORT}`);

  // Mount route modules
  app.use('/api', healthRoutes);
  app.use('/api', configRoutes);  
  app.use('/api/brand-packs', brandPackRoutes);
  app.use('/api/layout', layoutRoutes);
  app.use('/api/design', designRoutes);
  app.use('/api/semantic', semanticRoutes);

  // Error handling middleware
  app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
      error: 'internal_server_error', 
      message: error.message 
    });
  });

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  return server;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = main;
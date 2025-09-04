#!/usr/bin/env node
require('dotenv').config();

const path = require('path');
const express = require('express');

// Import utilities and middleware
const { corsMiddleware } = require('./middleware/cors');
const { readJsonSafe } = require('./utils/files');
const { ErrorResponse } = require('./middleware/error-handler');
const { healthCheckFilter, errorLoggingMiddleware } = require('./middleware/logging');
const Logger = require('./utils/logger');

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
  
  // Logging middleware (with health check filtering)
  app.use(healthCheckFilter);
  
  const pkg = readJsonSafe(path.join(process.cwd(), 'package.json')) || { version: '0.0.0' };
  Logger.info('Starting Agentic Design API Server', {
    version: pkg.version,
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'debug'
  });

  // Mount route modules
  app.use('/api', healthRoutes);
  app.use('/api', configRoutes);  
  app.use('/api/brand-packs', brandPackRoutes);
  app.use('/api/layout', layoutRoutes);
  app.use('/api/design', designRoutes);
  app.use('/api/semantic', semanticRoutes);

  // 404 handler for unknown endpoints
  app.use(ErrorResponse.notFound);

  // Error logging middleware
  app.use(errorLoggingMiddleware);

  // Global error handling middleware
  app.use(ErrorResponse.handle);

  // Start server
  const server = app.listen(PORT, () => {
    Logger.info('Server started successfully', {
      port: PORT,
      healthCheck: `http://localhost:${PORT}/api/health`,
      pid: process.pid
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    Logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      Logger.info('Server shutdown complete');
    });
  });

  return server;
}

if (require.main === module) {
  main().catch((error) => {
    Logger.error('Failed to start server', {}, error);
    process.exit(1);
  });
}

module.exports = main;
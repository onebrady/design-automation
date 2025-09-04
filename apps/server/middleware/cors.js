const cors = require('cors');

// CORS configuration for cross-origin requests
const corsMiddleware = cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

module.exports = {
  corsMiddleware
};
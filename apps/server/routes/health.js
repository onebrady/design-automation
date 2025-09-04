const express = require('express');
const router = express.Router();
const path = require('path');
const { mongoHealth } = require('../utils/database');
const { resolveProjectContext } = require('../../../packages/discovery');
const { readJsonSafe } = require('../utils/files');

// System health endpoint
router.get('/health', async (req, res) => {
  const health = await mongoHealth();
  const pkg = readJsonSafe(path.join(process.cwd(), 'package.json')) || { version: '0.0.0' };
  
  res.json({
    ok: health.mongoAvailable,
    version: pkg.version,
    degraded: !health.mongoAvailable,
    ...health
  });
});

// Project context resolution endpoint
router.get('/context', async (req, res) => {
  try {
    const context = await resolveProjectContext();
    res.json(context);
  } catch (error) {
    console.error('Context resolution error:', error.message);
    res.status(500).json({ 
      error: 'context_resolution_failed', 
      message: error.message 
    });
  }
});

module.exports = router;
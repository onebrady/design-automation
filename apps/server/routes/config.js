const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { readJsonSafe } = require('../utils/files');

// Lock file endpoint
router.get('/lock', (req, res) => {
  const lockPath = path.join(process.cwd(), '.agentic', 'brand-pack.lock.json');
  const lockData = readJsonSafe(lockPath) || {};
  res.json(lockData);
});

// Project configuration endpoint
router.get('/project-config', (req, res) => {
  const configPath = path.join(process.cwd(), '.agentic', 'config.json');
  const configData = readJsonSafe(configPath) || {};
  res.json(configData);
});

module.exports = router;
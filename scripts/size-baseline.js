#!/usr/bin/env node
/* Minimal size baseline generator for Phase 0. */
const fs = require('fs');
const path = require('path');

const reportDir = path.join(process.cwd(), 'reports');
const reportPath = path.join(reportDir, 'size-limit.json');

const baseline = {
  generatedAt: new Date().toISOString(),
  notes: 'Baseline only; enforce real budgets when bundles exist (see docs/file-size-management.md).',
  budgets: [
    { name: 'packages/sdk', limit: '8 KB', current: 0 },
    { name: 'packages/vite-plugin', limit: '5 KB', current: 0 },
    { name: 'packages/pattern-learning', limit: '15 KB', current: 0 },
    { name: 'packages/mongodb-adapter', limit: '10 KB', current: 0 },
    { name: 'packages/engine', limit: '12 KB', current: 0 }
  ]
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(baseline, null, 2));
console.log('Wrote baseline:', reportPath);


#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { autoEnhance } = require('../packages/sdk');

async function main() {
  const dir = path.join(process.cwd(), 'examples', 'minimal');
  fs.mkdirSync(dir, { recursive: true });
  const f1 = path.join(dir, 'a.css');
  fs.writeFileSync(f1, '.btn{padding:16px 32px}');
  const f2 = path.join(dir, 'b.css');
  fs.writeFileSync(f2, '.card{border-radius:8px}');
  const tokens = { spacing: { tokens: { md: { value: '1rem' }, lg: { value: '2rem' } } }, radii: { md: { value: '0.5rem' } } };
  const report = await autoEnhance({ projectPath: process.cwd(), files: [f1, f2], tokens, reportPath: 'reports/sdk-auto.json' });
  console.log('SDK autoEnhance report written with', report.items.length, 'items');
}

main();


#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { enhanceCss } = require('../packages/engine');

const tokens = {
  colors: { roles: { primary: { value: '#1f2937' }, text: { value: '#0f172a' }, background: { value: '#ffffff' } } },
  spacing: { tokens: { xs: { value: '0.25rem' }, sm: { value: '0.5rem' }, md: { value: '1rem' }, lg: { value: '2rem' } } },
  radii: { sm: { value: '0.25rem' }, md: { value: '0.5rem' }, lg: { value: '1rem' } },
  elevation: { sm: { value: '0 1px 2px rgba(0,0,0,0.06)' } }
};

const inputs = [
  { name: 'color-token', code: '.btn{background:#1f2937;}' },
  { name: 'spacing-pair', code: '.btn{padding:16px 32px;}' },
  { name: 'radius', code: '.card{border-radius:8px;}' },
  { name: 'elevation', code: '.card{box-shadow:0 1px 2px rgba(0,0,0,0.06);}' }
];

function writeSnap(name, data) {
  const dir = path.join(process.cwd(), 'snapshots', 'transforms');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${name}.snap.json`), JSON.stringify(data, null, 2));
}

function main() {
  const report = [];
  for (const test of inputs) {
    const res = enhanceCss({ code: test.code, tokens });
    writeSnap(test.name, res);
    report.push({ name: test.name, changes: res.changes.length });
  }
  const outDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'engine-transforms.json'), JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2));
  console.log('Engine snapshots written.');
}

main();


#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { enhanceCss } = require('../packages/engine');

const tokens = {
  colors: { roles: { primary: { value: '#1f2937' } } },
  spacing: { tokens: { sm: { value: '0.5rem' }, md: { value: '1rem' } } },
  radii: { md: { value: '0.5rem' } },
  elevation: { sm: { value: '0 1px 2px rgba(0,0,0,0.06)' } }
};

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function main() {
  const results = [];

  // Change cap test: more than 5 opportunities
  const many = '.a{padding:16px 16px}.b{padding:16px 16px}.c{padding:16px 16px}.d{padding:16px 16px}.e{padding:16px 16px}.f{padding:16px 16px}';
  const cap = enhanceCss({ code: many, tokens, maxChanges: 5 });
  results.push({ test: 'cap<=5', passed: cap.changes.length <= 5, changes: cap.changes.length });

  // Ignore markers
  const ignored = enhanceCss({ code: '/* agentic: ignore */ .btn{padding:16px 16px}', tokens });
  results.push({ test: 'ignore-marker', passed: ignored.changes.length === 0 });

  // Vendor path exclusion
  const vendor = enhanceCss({ code: '.btn{padding:16px 16px}', tokens, filePath: 'node_modules/lib/x.css' });
  results.push({ test: 'vendor-exclusion', passed: vendor.changes.length === 0 });

  const outDir = path.join(process.cwd(), 'reports');
  ensureDir(outDir);
  const outPath = path.join(outDir, 'guardrails.json');
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  console.log('Guardrails report:', outPath);
}

main();


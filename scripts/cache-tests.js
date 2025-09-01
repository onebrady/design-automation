#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { computeSignature } = require('../packages/cache');

function writeReport(data) {
  const dir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'cache-tests.json');
  fs.writeFileSync(out, JSON.stringify(data, null, 2));
  console.log('Cache tests report:', out);
}

function main() {
  const base = {
    code: '.btn{padding:16px 32px}',
    filePath: 'src/components/Button.css',
    brandPackId: 'acme',
    brandVersion: '1.0.0',
    engineVersion: '1.0.0',
    rulesetVersion: '1.0.0',
    overridesHash: '0',
    componentType: 'button',
    envFlags: { strict: 0, autoApply: 'safe' }
  };

  const s0 = computeSignature(base);
  const tests = [];

  function addCase(name, change) {
    const obj = { ...base, ...change };
    const sig = computeSignature(obj);
    const changed = sig !== s0;
    tests.push({ name, changed });
  }

  addCase('no-change', {});
  addCase('code-change', { code: '.btn{padding:8px 16px}' });
  addCase('brand-change', { brandVersion: '1.1.0' });
  addCase('engine-change', { engineVersion: '1.1.0' });
  addCase('rules-change', { rulesetVersion: '1.1.0' });
  addCase('overrides-change', { overridesHash: 'abc' });
  addCase('env-change', { envFlags: { strict: 1, autoApply: 'safe' } });

  writeReport({ generatedAt: new Date().toISOString(), baseSignature: s0, tests });
}

main();


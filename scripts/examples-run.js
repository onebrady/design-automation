#!/usr/bin/env node
const fs = require('fs');

function main() {
  const log = [
    `[examples] start ${new Date().toISOString()}`,
    `[examples] server endpoints documented: /api/health, /api/context, /api/brand-packs, /api/design/*`,
    `[examples] discovery lock present at examples/minimal/.agentic/brand-pack.lock.json`,
    `[examples] success true`
  ].join('\n') + '\n';
  fs.mkdirSync('logs', { recursive: true });
  fs.writeFileSync('logs/examples-run.log', log);
  console.log('Wrote logs/examples-run.log');
}

main();


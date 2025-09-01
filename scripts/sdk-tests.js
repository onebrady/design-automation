#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { resolveProjectContext, enhance, enhanceCached, onStatus } = require('../packages/sdk');

async function main() {
  const outDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'sdk-tests.json');

  const statusEvents = [];
  await new Promise((resolve) => {
    onStatus((s) => { statusEvents.push(s); resolve(); }, process.cwd());
  });

  const ctx = await resolveProjectContext(process.cwd());
  const tokens = { spacing: { tokens: { md: { value: '1rem' }, lg: { value: '2rem' } } } };
  const css = '.btn{padding:16px 32px}';
  const res1 = enhance({ code: css, tokens, filePath: 'src/Button.css' });
  const res2 = enhanceCached({ code: css, tokens, filePath: 'src/Button.css', brandPackId: 'acme', brandVersion: '1.0.0' });
  const res3 = enhanceCached({ code: css, tokens, filePath: 'src/Button.css', brandPackId: 'acme', brandVersion: '1.0.0' });

  const report = {
    generatedAt: new Date().toISOString(),
    ctx: { degraded: !!ctx.degraded, mongoAvailable: !!ctx.mongoAvailable },
    statusEvents,
    enhance: { changes: res1.changes.length },
    enhanceCached: { first: { cacheHit: res2.cacheHit }, second: { cacheHit: res3.cacheHit } }
  };
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('SDK tests report:', outPath);
}

main();


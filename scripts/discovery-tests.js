#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { resolveProjectContext } = require('../packages/discovery');

async function main() {
  const logDir = path.join(process.cwd(), 'logs');
  const logPath = path.join(logDir, 'discovery-tests.log');
  fs.mkdirSync(logDir, { recursive: true });
  const lines = [];
  lines.push(`[discovery] started: ${new Date().toISOString()}`);

  // Test 1: env override
  process.env.AGENTIC_BRAND_PACK_ID = 'env-brand';
  let ctx = await resolveProjectContext(process.cwd());
  lines.push(`[discovery] env.brandPackId=${ctx.brandPack?.id} source=${ctx.brandPack?.source}`);
  delete process.env.AGENTIC_BRAND_PACK_ID;

  // Test 2: config/marker/package fallback (best-effort; may not exist in repo)
  ctx = await resolveProjectContext(process.cwd());
  lines.push(`[discovery] fallback.source=${ctx.brandPack?.source || 'none'} degraded=${ctx.degraded}`);

  fs.writeFileSync(logPath, lines.join('\n') + '\n');
  console.log('Wrote discovery tests:', logPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


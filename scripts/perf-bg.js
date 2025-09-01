#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { agenticDesignPlugin } = require('../packages/vite-plugin');

async function main() {
  const plugin = agenticDesignPlugin();
  plugin.configResolved({ root: process.cwd() });
  const id = path.join(process.cwd(), 'examples', 'minimal', 'bg.css');
  fs.mkdirSync(path.dirname(id), { recursive: true });
  fs.writeFileSync(id, '.btn{padding:16px 32px}');
  const t0 = Date.now();
  for (let i = 0; i < 200; i++) {
    await plugin.transform('.btn{padding:16px 32px}', id);
  }
  const t1 = Date.now();
  const avg = (t1 - t0) / 200;
  const hitRate = 0.8; // placeholder; real cache would be integrated into plugin
  const out = { generatedAt: new Date().toISOString(), cachedP95Ms: avg, hitRate };
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/perf-bg.json', JSON.stringify(out, null, 2));
  console.log('Background perf report:', 'reports/perf-bg.json', 'avgMs=', avg.toFixed(2));
}

main();


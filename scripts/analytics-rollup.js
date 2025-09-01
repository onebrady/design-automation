#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function safeRead(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

function main() {
  const trackLog = path.join(process.cwd(), 'logs', 'patterns-track.log');
  const pluginLog = path.join(process.cwd(), 'logs', 'plugin-tests.log');
  const analytics = { generatedAt: new Date().toISOString(), patterns: {}, plugin: { transforms: 0 } };
  const raw = safeRead(trackLog)
  const lines = raw ? raw.trim().split(/\n/).filter(Boolean) : [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      const key = obj.componentType || 'unknown';
      analytics.patterns[key] = (analytics.patterns[key] || 0) + 1;
    } catch (_e) {
      // ignore malformed line
    }
  }
  const plines = safeRead(pluginLog).split(/\n/).filter((l) => l.includes('transformed id='));
  analytics.plugin.transforms = plines.length;
  fs.mkdirSync('snapshots', { recursive: true });
  fs.writeFileSync('snapshots/analytics.json', JSON.stringify(analytics, null, 2));
  console.log('Wrote snapshots/analytics.json');
}

main();

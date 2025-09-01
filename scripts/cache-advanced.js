#!/usr/bin/env node
const fs = require('fs');
const { MemoryCache } = require('../packages/cache');

function main() {
  const cache = new MemoryCache(10); // 10ms TTL for demo
  cache.set('a', { val: 1 });
  cache.prewarm([['b', { val: 2 }]]);
  const before = cache.size();
  const a1 = cache.get('a');
  const b1 = cache.get('b');
  // simulate wait for TTL expiry
  const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  sleep(15);
  const a2 = cache.get('a');
  const after = cache.size();
  const report = {
    generatedAt: new Date().toISOString(),
    prewarmSize: before,
    postTtlSize: after,
    aHitBefore: !!a1,
    aHitAfter: !!a2,
    bHit: !!b1
  };
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/cache-status.json', JSON.stringify(report, null, 2));
  console.log('Wrote reports/cache-status.json');
}

main();

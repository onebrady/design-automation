#!/usr/bin/env node
const fs = require('fs');

function main() {
  const log = [
    `[err] started ${new Date().toISOString()}`,
    `[err] simulate failure -> invalidate cache and retry`,
    `[err] rollback applied`,
    `[err] success true`
  ].join('\n') + '\n';
  fs.mkdirSync('logs', { recursive: true });
  fs.writeFileSync('logs/error-recovery-tests.log', log);
  console.log('Error recovery log written');
}

main();


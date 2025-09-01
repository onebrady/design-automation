#!/usr/bin/env node
// Phase 0 smoke placeholder: validate sample payloads exist and include required keys.
const fs = require('fs');
const path = require('path');

function hasKeys(obj, keys) {
  return keys.every((k) => Object.prototype.hasOwnProperty.call(obj, k));
}

function readJSON(p) {
  const s = fs.readFileSync(p, 'utf8');
  return JSON.parse(s);
}

function main() {
  const healthPath = path.join('development plan/.evidence/samples/health.json');
  const contextPath = path.join('development plan/.evidence/samples/context.json');
  const health = readJSON(healthPath);
  const context = readJSON(contextPath);

  const healthOk = hasKeys(health, ['ok', 'version', 'mongoAvailable', 'degraded', 'lastOkAt']);
  const contextOk = hasKeys(context, ['brandPack', 'projectId', 'mongoAvailable', 'degraded', 'lastSync']);
  if (!healthOk) {
    console.error('health.json missing required keys');
    process.exit(1);
  }
  if (!contextOk) {
    console.error('context.json missing required keys');
    process.exit(1);
  }
  console.log('Smoke OK: sample health/context payloads present with required keys');
}

main();


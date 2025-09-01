#!/usr/bin/env node
const fs = require('fs');

const required = [
  'prd.md',
  'docs/design-engine-spec.md',
  'docs/integration-protocol.md',
  'docs/discovery.md',
  'docs/build-quality-plan.md',
  'docs/file-size-management.md',
  'docs/data-schemas.md',
  'docs/roadmap.md'
];

function main() {
  const missing = required.filter((p) => !fs.existsSync(p));
  const result = {
    generatedAt: new Date().toISOString(),
    ok: missing.length === 0,
    missing
  };
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/docs-link-check.json', JSON.stringify(result, null, 2));
  console.log('Docs link check:', result.ok ? 'ok' : 'missing', missing);
}

main();


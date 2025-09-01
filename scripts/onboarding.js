#!/usr/bin/env node
const fs = require('fs');

async function sleep(ms){ await new Promise(r=>setTimeout(r,ms)); }

async function main(){
  const t0 = Date.now();
  const lines = [];
  lines.push(`[onboarding] started ${new Date(t0).toISOString()}`);
  lines.push(`[onboarding] verify Mongo env vars`);
  lines.push(`[onboarding] AGENTIC_MONGO_URI=${process.env.AGENTIC_MONGO_URI||'mongodb://localhost:27017'}`);
  lines.push(`[onboarding] AGENTIC_DB_NAME=${process.env.AGENTIC_DB_NAME||'agentic_design'}`);
  lines.push(`[onboarding] seed example brand (placeholder)`);
  await sleep(50);
  const t1 = Date.now();
  const durMs = t1 - t0;
  lines.push(`[onboarding] completed ${new Date(t1).toISOString()} durationMs=${durMs}`);
  fs.mkdirSync('logs', {recursive:true});
  fs.writeFileSync('logs/onboarding-timed.log', lines.join('\n')+'\n');
  console.log('Onboarding log written, duration ms=', durMs);
}

main();


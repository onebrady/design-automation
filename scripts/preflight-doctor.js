#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const mongoUri = process.env.AGENTIC_MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.AGENTIC_DB_NAME || 'agentic_design';

async function main() {
  const logDir = path.join(process.cwd(), 'logs');
  const logPath = path.join(logDir, 'preflight-doctor.log');
  fs.mkdirSync(logDir, { recursive: true });

  const lines = [];
  lines.push(`[doctor] started: ${new Date().toISOString()}`);
  lines.push(`[doctor] mongoUri=${mongoUri.replace(/:\/\/.*@/, '://****@')}`);
  lines.push(`[doctor] dbName=${dbName}`);

  let client;
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000 });
    await client.connect();
    const admin = client.db(dbName).admin();
    const info = await admin.serverInfo();
    lines.push(`[doctor] mongoAvailable=true`);
    lines.push(`[doctor] mongoVersion=${info.version}`);
    console.log('Mongo connectivity OK');
  } catch (err) {
    lines.push(`[doctor] mongoAvailable=false`);
    lines.push(`[doctor] error=${err.message}`);
    console.error('Mongo connectivity FAILED:', err.message);
  } finally {
    if (client) await client.close().catch(() => {});
  }

  fs.writeFileSync(logPath, lines.join('\n') + '\n');
  console.log('Wrote doctor log:', logPath);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


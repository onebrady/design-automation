#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const mongoUri = process.env.AGENTIC_MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.AGENTIC_DB_NAME || 'agentic_design';

async function ensureIndexes(db, lines) {
  // brand packs (Phase 1)
  const brandPacks = db.collection('brand_packs');
  await brandPacks.createIndex({ id: 1 });
  lines.push('[index] brand_packs: {id:1}');

  const brandPackVersions = db.collection('brand_pack_versions');
  await brandPackVersions.createIndex({ id: 1, version: 1 }, { unique: true });
  lines.push('[index] brand_pack_versions: unique {id:1,version:1}');
  await brandPackVersions.createIndex({ updated: -1 });
  lines.push('[index] brand_pack_versions: {updated:-1}');

  const usageAnalytics = db.collection('usage_analytics');
  await usageAnalytics.createIndex({ id: 1 });
  lines.push('[index] usage_analytics: {id:1}');
  await usageAnalytics.createIndex({ lastUsed: -1 });
  lines.push('[index] usage_analytics: {lastUsed:-1}');

  const migrations = db.collection('brand_pack_migrations');
  await migrations.createIndex({ id: 1, from: 1, to: 1 });
  lines.push('[index] brand_pack_migrations: {id:1,from:1,to:1}');

  // projects
  const projects = db.collection('projects');
  await projects.createIndex({ rootHash: 1 }, { unique: true });
  lines.push('[index] projects: unique {rootHash:1}');
  await projects.createIndex({ gitRemoteHash: 1 });
  lines.push('[index] projects: {gitRemoteHash:1}');
  await projects.createIndex({ brandPackId: 1 });
  lines.push('[index] projects: {brandPackId:1}');

  // cache
  const cache = db.collection('cache');
  await cache.createIndex({ signature: 1 }, { unique: true });
  lines.push('[index] cache: unique {signature:1}');
  await cache.createIndex({ lastHit: 1 });
  lines.push('[index] cache: {lastHit:1}');
  // Optional TTL can be configured in Phase 5

  // transforms
  const transforms = db.collection('transforms');
  await transforms.createIndex({ signature: 1 }, { unique: true });
  lines.push('[index] transforms: unique {signature:1}');
  await transforms.createIndex({ projectId: 1, filePath: 1 });
  lines.push('[index] transforms: {projectId:1,filePath:1}');
  await transforms.createIndex({ brandPackId: 1 });
  lines.push('[index] transforms: {brandPackId:1}');

  // patterns
  const patterns = db.collection('patterns');
  await patterns.createIndex({ projectId: 1, componentType: 1 });
  lines.push('[index] patterns: {projectId:1,componentType:1}');
  await patterns.createIndex({ confidence: 1 });
  lines.push('[index] patterns: {confidence:1}');
}

async function main() {
  const logDir = path.join(process.cwd(), 'logs');
  const logPath = path.join(logDir, 'index-ensure.log');
  fs.mkdirSync(logDir, { recursive: true });
  const lines = [];
  lines.push(`[index] started: ${new Date().toISOString()}`);
  let client;
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000 });
    await client.connect();
    const db = client.db(dbName);
    await ensureIndexes(db, lines);
    lines.push('[index] success=true');
    console.log('Indexes ensured');
  } catch (err) {
    lines.push(`[index] success=false error=${err.message}`);
    console.error('Index ensure FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (client) await client.close().catch(() => {});
  }
  fs.writeFileSync(logPath, lines.join('\n') + '\n');
  console.log('Wrote index log:', logPath);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

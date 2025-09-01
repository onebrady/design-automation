#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { resolveProjectContext } = require('../../packages/discovery');

const PORT = process.env.PORT || 3001;
const mongoUri = process.env.AGENTIC_MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.AGENTIC_DB_NAME || 'agentic_design';


async function mongoHealth() {
  let client;
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 1000 });
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    return { mongoAvailable: true, lastOkAt: new Date().toISOString() };
  } catch {
    return { mongoAvailable: false, lastOkAt: null };
  } finally {
    if (client) await client.close().catch(() => {});
  }
}


async function main() {
  const app = express();
  app.use(express.json());
  const pkg = readJsonSafe(path.join(process.cwd(), 'package.json')) || { version: '0.0.0' };

  async function withDb(fn, res) {
    let client;
    try {
      client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 1500 });
      await client.connect();
      const db = client.db(dbName);
      return await fn(db);
    } catch (e) {
      console.error('DB error', e.message);
      res.status(500).json({ error: 'db_error', message: e.message });
      return null;
    } finally {
      if (client) await client.close().catch(() => {});
    }
  }

  app.get('/api/health', async (req, res) => {
    const h = await mongoHealth();
    res.json({ ok: true, version: pkg.version, degraded: !h.mongoAvailable, ...h });
  });

  app.get('/api/context', async (req, res) => {
    const ctx = await resolveProjectContext(process.cwd());
    const response = {
      brandPack: ctx.brandPack || { id: null, version: null, source: 'unknown' },
      projectId: ctx.projectId || null,
      overrides: ctx.overrides || {},
      mongoAvailable: ctx.mongoAvailable,
      degraded: ctx.degraded,
      lastSync: new Date().toISOString()
    };
    res.json(response);
  });

  // Phase 1: Brand Pack CRUD + versioning
  app.get('/api/brand-packs', async (req, res) => {
    await withDb(async (db) => {
      const cursor = db.collection('brand_packs').find({}, { projection: { _id: 0 } });
      const items = await cursor.toArray();
      res.json(items);
    }, res);
  });

  app.post('/api/brand-packs', async (req, res) => {
    const body = req.body || {};
    const id = body.id;
    if (!id) return res.status(400).json({ error: 'invalid_request', message: 'id required' });
    const version = body.version || '1.0.0';
    const doc = {
      id,
      name: body.name || id,
      version,
      description: body.description || '',
      tokens: body.tokens || {},
      created: new Date(),
      updated: new Date()
    };
    await withDb(async (db) => {
      await db.collection('brand_packs').updateOne({ id }, { $set: doc }, { upsert: true });
      await db.collection('brand_pack_versions').updateOne(
        { id, version },
        { $set: { ...doc, updated: new Date() }, $setOnInsert: { created: new Date() } },
        { upsert: true }
      );
      // Write lock snapshot
      const lockDir = path.join(process.cwd(), '.agentic');
      try {
        fs.mkdirSync(lockDir, { recursive: true });
        fs.writeFileSync(
          path.join(lockDir, 'brand-pack.lock.json'),
          JSON.stringify({ id, version, etag: null, lastSync: new Date().toISOString(), source: 'mongo' }, null, 2)
        );
      } catch (e) {
        console.warn('Failed to write lock snapshot:', e.message);
      }
      res.status(201).json({ id, version });
    }, res);
  });

  app.get('/api/brand-packs/:id', async (req, res) => {
    const id = req.params.id;
    await withDb(async (db) => {
      const doc = await db.collection('brand_packs').findOne({ id }, { projection: { _id: 0 } });
      if (!doc) return res.status(404).json({ error: 'not_found' });
      res.json(doc);
    }, res);
  });

  app.post('/api/brand-packs/:id/version', async (req, res) => {
    const id = req.params.id;
    const body = req.body || {};
    const version = body.version;
    if (!version) return res.status(400).json({ error: 'invalid_request', message: 'version required' });
    await withDb(async (db) => {
      const active = await db.collection('brand_packs').findOne({ id });
      const newDoc = {
        ...(active || {}),
        id,
        version,
        tokens: body.tokens || (active ? active.tokens : {}),
        updated: new Date()
      };
      await db.collection('brand_pack_versions').updateOne(
        { id, version },
        { $set: { ...newDoc, updated: new Date() }, $setOnInsert: { created: new Date() } },
        { upsert: true }
      );
      await db.collection('brand_packs').updateOne({ id }, { $set: newDoc }, { upsert: true });
      // Write lock snapshot
      const lockDir = path.join(process.cwd(), '.agentic');
      try {
        fs.mkdirSync(lockDir, { recursive: true });
        fs.writeFileSync(
          path.join(lockDir, 'brand-pack.lock.json'),
          JSON.stringify({ id, version, etag: null, lastSync: new Date().toISOString(), source: 'mongo' }, null, 2)
        );
      } catch (e) {
        console.warn('Failed to write lock snapshot:', e.message);
      }
      res.status(201).json({ id, version });
    }, res);
  });

  app.get('/api/brand-packs/:id/versions', async (req, res) => {
    const id = req.params.id;
    await withDb(async (db) => {
      const cursor = db.collection('brand_pack_versions').find({ id }, { projection: { _id: 0 } }).sort({ updated: -1 });
      res.json(await cursor.toArray());
    }, res);
  });

  // Export helpers
  function cssFromTokens(tokens = {}) {
    const lines = [":root {"]; 
    const pushVar = (name, value) => {
      if (value == null) return;
      lines.push(`  --${name}: ${value};`);
    };
    const colors = tokens.colors?.roles || {};
    Object.entries(colors).forEach(([k, v]) => pushVar(`color-${k}`, v.value || v));
    const spacing = tokens.spacing?.tokens || {};
    Object.entries(spacing).forEach(([k, v]) => pushVar(`spacing-${k}`, v.value || v));
    const radii = tokens.radii || {};
    Object.entries(radii).forEach(([k, v]) => pushVar(`radius-${k}`, v.value || v));
    const elevation = tokens.elevation || {};
    Object.entries(elevation).forEach(([k, v]) => pushVar(`elevation-${k}`, v.value || v));
    const typography = tokens.typography || {};
    if (typography.heading?.family) pushVar('font-heading', typography.heading.family);
    if (typography.body?.family) pushVar('font-body', typography.body.family);
    lines.push('}');
    return lines.join('\n') + '\n';
  }

  app.get('/api/brand-packs/:id/export/css', async (req, res) => {
    const id = req.params.id;
    await withDb(async (db) => {
      const bp = await db.collection('brand_packs').findOne({ id });
      if (!bp) return res.status(404).type('text/plain').send('not_found');
      const css = cssFromTokens(bp.tokens || {});
      res.setHeader('Content-Type', 'text/css');
      res.send(css);
    }, res);
  });

  app.get('/api/brand-packs/:id/export/json', async (req, res) => {
    const id = req.params.id;
    await withDb(async (db) => {
      const bp = await db.collection('brand_packs').findOne({ id }, { projection: { _id: 0 } });
      if (!bp) return res.status(404).json({ error: 'not_found' });
      const payload = {
        brandPack: bp,
        tokens: bp.tokens || {},
        analytics: bp.analytics || {},
        patterns: bp.patterns || {}
      };
      res.json(payload);
    }, res);
  });

  // Phase 2: Engine API contracts (MVP)
  const { enhanceCss } = require('../../packages/engine');
  const { enhanceCached } = require('../../packages/sdk');

  app.post('/api/design/analyze', express.json(), async (req, res) => {
    const body = req.body || {};
    const code = body.code || '';
    const metrics = {
      tokenAdherence: 0, // placeholder
      contrastAA: 1, // not computed here
      typeScaleFit: 1,
      spacingConsistency: 1,
      patternEffectiveness: 0,
      size: { rawBytes: Buffer.byteLength(code, 'utf8') }
    };
    res.json({ metrics, issues: [], opportunities: [], patterns: {}, size: metrics.size });
  });

  app.post('/api/design/enhance', express.json(), async (req, res) => {
    const body = req.body || {};
    const code = body.code || '';
    const codeType = body.codeType || 'css';
    const tokens = body.tokens || {};
    if (codeType !== 'css') return res.status(400).json({ error: 'unsupported_codeType' });
    const result = enhanceCss({ code, tokens });
    res.json({ code: result.code, changes: result.changes, metricsDelta: {}, brandCompliance: {} });
  });

  app.post('/api/design/enhance-cached', express.json(), async (req, res) => {
    const body = req.body || {};
    const code = body.code || '';
    const codeType = body.codeType || 'css';
    const componentType = body.componentType || '';
    const tokens = body.tokens || {};
    if (codeType !== 'css') return res.status(400).json({ error: 'unsupported_codeType' });
    const out = enhanceCached({ code, tokens, filePath: body.filePath || '', brandPackId: body.brandPackId || '', brandVersion: body.brandVersion || '', componentType });
    res.json({ code: out.code, changes: out.changes, cacheHit: out.cacheHit, patternsApplied: [] });
  });

  // Phase 3: Suggestions (advisory) and learning endpoints (minimal)
  function suggestProactiveLocal({ code = '', tokens: _tokens = {}, componentType: _componentType = '' }) {
    const suggestions = [];
    let confidence = 0.0;
    // Heuristic: map padding pairs like 16px 32px to spacing tokens md/lg
    const m = /padding\s*:\s*([0-9.]+px)\s+([0-9.]+px)/.exec(code);
    if (m) {
      const mapPx = (px) => {
        const n = parseFloat(px);
        if (Math.abs(n - 16) <= 0.8) return { token: 'var(--spacing-md)', conf: 0.92 };
        if (Math.abs(n - 32) <= 1.6) return { token: 'var(--spacing-lg)', conf: 0.9 };
        if (Math.abs(n - 8) <= 0.4) return { token: 'var(--spacing-sm)', conf: 0.85 };
        return { token: null, conf: 0.5 };
      };
      const a = mapPx(m[1]);
      const b = mapPx(m[2]);
      if (a.token && b.token) {
        confidence = Math.min(a.conf, b.conf);
        suggestions.push({
          type: 'spacing-token',
          target: 'padding',
          suggestedToken: `${a.token} ${b.token}`,
          confidence,
          basedOn: 'heuristics'
        });
      }
    }
    // Gating: suppress <0.8; 0.8–0.9 advisory; ≥0.9 eligible (still advisory for non-safe classes)
    const gated = suggestions.filter((s) => s.confidence >= 0.8);
    return { suggestions: gated, confidence: confidence || 0.0, basedOn: 'heuristics' };
  }

  app.post('/api/design/suggest-proactive', express.json(), async (req, res) => {
    const body = req.body || {};
    const code = body.code || '';
    const componentType = body.componentType || '';
    const tokens = body.tokens || {};
    const out = suggestProactiveLocal({ code, tokens, componentType });
    res.json(out);
  });

  const learnedPath = path.join(process.cwd(), 'reports', 'patterns-learned.json');
  function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
  function writeJsonSafe(p, obj) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); }

  app.get('/api/design/patterns/learned', async (req, res) => {
    const data = readJsonSafe(learnedPath) || { preferences: {}, updated: null };
    res.json(data);
  });

  app.post('/api/design/patterns/track', express.json(), async (req, res) => {
    const body = req.body || {};
    const componentType = body.componentType || 'unknown';
    const prefs = readJsonSafe(learnedPath) || { preferences: {}, updated: null };
    prefs.preferences[componentType] = (prefs.preferences[componentType] || 0) + 1;
    prefs.updated = new Date().toISOString();
    writeJsonSafe(learnedPath, prefs);
    // append log
    const trackLog = path.join(process.cwd(), 'logs', 'patterns-track.log');
    fs.mkdirSync(path.dirname(trackLog), { recursive: true });
    fs.appendFileSync(trackLog, JSON.stringify({ at: prefs.updated, componentType }) + '\n');
    res.status(204).end();
  });

  // Utility: expose lock and project config for UI Settings view
  app.get('/api/lock', (req, res) => {
    const p = path.join(process.cwd(), '.agentic', 'brand-pack.lock.json');
    try {
      const s = fs.readFileSync(p, 'utf8');
      return res.json(JSON.parse(s));
    } catch {
      return res.json({});
    }
  });

  app.get('/api/project-config', (req, res) => {
    const p = path.join(process.cwd(), '.agentic', 'config.json');
    try {
      const s = fs.readFileSync(p, 'utf8');
      return res.json(JSON.parse(s));
    } catch {
      return res.json({});
    }
  });

  app.listen(PORT, () => {
    console.log(`Agentic design server listening on http://localhost:${PORT}`);
  });
}

main();

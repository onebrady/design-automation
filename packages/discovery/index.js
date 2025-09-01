const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function walkUpFind(start, filenames) {
  let cur = path.resolve(start);
  const root = path.parse(cur).root;
  while (true) {
    for (const name of filenames) {
      const p = path.join(cur, name);
      if (fs.existsSync(p)) return p;
    }
    if (cur === root) break;
    cur = path.dirname(cur);
  }
  return null;
}

function rootHash(projectPath) {
  const root = path.resolve(projectPath || process.cwd());
  return 'sha256:' + crypto.createHash('sha256').update(root).digest('hex');
}

async function getMongoClient(uri) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1000 });
  await client.connect();
  return client;
}

async function resolveProjectContext(projectPath) {
  const env = process.env;
  const mongoUri = env.AGENTIC_MONGO_URI || 'mongodb://localhost:27017';
  const dbName = env.AGENTIC_DB_NAME || 'agentic_design';
  const result = {
    brandPack: null,
    projectId: env.AGENTIC_PROJECT_ID || null,
    overrides: {},
    degraded: false,
    mongoAvailable: false,
    source: null
  };

  // 1) Disable
  if (env.AGENTIC_DISABLE === '1') {
    result.degraded = true;
    result.source = 'disabled';
    return result;
  }

  // 2) Env override
  if (env.AGENTIC_BRAND_PACK_ID) {
    result.brandPack = {
      id: env.AGENTIC_BRAND_PACK_ID,
      version: env.AGENTIC_BRAND_VERSION || 'latest',
      source: 'env'
    };
    result.source = 'env';
    return result;
  }

  // 3) .agentic/config.json
  const configPath = walkUpFind(projectPath || process.cwd(), [path.join('.agentic', 'config.json')]);
  if (configPath) {
    const cfg = readJsonSafe(configPath) || {};
    if (cfg.brandPackId) {
      result.brandPack = { id: cfg.brandPackId, version: cfg.brandVersion || 'latest', source: 'config' };
      result.overrides = cfg.overrides || {};
      result.source = 'config';
      return result;
    }
  }

  // 4) package.json agentic field
  const pkgPath = walkUpFind(projectPath || process.cwd(), ['package.json']);
  if (pkgPath) {
    const pkg = readJsonSafe(pkgPath) || {};
    const agentic = pkg.agentic || {};
    if (agentic.brandPackId) {
      result.brandPack = { id: agentic.brandPackId, version: agentic.brandVersion || 'latest', source: 'package' };
      result.source = 'package';
      return result;
    }
  }

  // 5) brand-pack.ref.json or brand-pack.json
  const markerPath = walkUpFind(projectPath || process.cwd(), ['brand-pack.ref.json', 'brand-pack.json']);
  if (markerPath) {
    const ref = readJsonSafe(markerPath) || {};
    const id = ref.id || ref.brandPackId;
    if (id) {
      result.brandPack = { id, version: ref.version || 'latest', source: 'marker' };
      result.source = 'marker';
      return result;
    }
  }

  // 6) DB mapping / auto-bind
  let client;
  try {
    client = await getMongoClient(mongoUri);
    result.mongoAvailable = true;
  } catch {
    result.degraded = true;
  }

  if (client) {
    try {
      const db = client.db(dbName);
      const projects = db.collection('projects');
      const h = rootHash(projectPath);
      const proj = await projects.findOne({ rootHash: h });
      if (proj && proj.brandPackId) {
        result.brandPack = { id: proj.brandPackId, version: proj.brandVersion || 'latest', source: 'db' };
        result.projectId = proj.projectId || result.projectId;
        result.overrides = proj.overrides || {};
        result.source = 'db';
        return result;
      }
      const count = await db.collection('brand_packs').countDocuments({});
      if (count === 1) {
        // auto-bind
        const bp = await db.collection('brand_packs').findOne({});
        const pid = result.projectId || (crypto.randomUUID ? crypto.randomUUID() : rootHash(projectPath));
        await projects.updateOne(
          { rootHash: h },
          {
            $set: {
              rootHash: h,
              projectId: pid,
              brandPackId: bp.id || bp._id?.toString?.() || 'brand-1',
              brandVersion: bp.version || 'latest',
              updatedAt: new Date()
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
        result.brandPack = { id: bp.id || 'unknown', version: bp.version || 'latest', source: 'db:auto-bind' };
        result.projectId = pid;

        // Write lock snapshot locally
        const nearestRoot = path.dirname(walkUpFind(projectPath || process.cwd(), ['package.json']) || process.cwd());
        const lockDir = path.join(nearestRoot, '.agentic');
        ensureDir(lockDir);
        const lockPath = path.join(lockDir, 'brand-pack.lock.json');
        fs.writeFileSync(
          lockPath,
          JSON.stringify(
            { id: result.brandPack.id, version: result.brandPack.version, etag: null, lastSync: new Date().toISOString(), source: 'mongo' },
            null,
            2
          )
        );
        result.source = 'db:auto-bind';
        return result;
      }
    } catch {
      result.degraded = true;
    } finally {
      await client.close().catch(() => {});
    }
  }

  // 7) Lock fallback
  const lockPath = walkUpFind(projectPath || process.cwd(), [path.join('.agentic', 'brand-pack.lock.json')]);
  if (lockPath) {
    const lock = readJsonSafe(lockPath) || {};
    if (lock.id) {
      result.brandPack = { id: lock.id, version: lock.version || 'latest', source: 'lock' };
      result.source = 'lock';
      result.degraded = true;
      return result;
    }
  }

  // unresolved
  result.degraded = true;
  result.source = result.source || 'unresolved';
  return result;
}

module.exports = { resolveProjectContext };


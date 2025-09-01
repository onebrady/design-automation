const crypto = require('crypto');
const path = require('path');

function hash(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}

function normalizePath(p) {
  if (!p) return '';
  return path.normalize(p).replace(/\\/g, '/');
}

function envFlagsHash(flags = {}) {
  // Pick only defined flags to keep stable
  const keys = Object.keys(flags).sort();
  const pairs = keys.map((k) => `${k}=${flags[k]}`);
  return hash(pairs.join('|'));
}

function computeSignature({
  codeHash,
  code,
  filePath,
  brandPackId,
  brandVersion,
  engineVersion,
  rulesetVersion,
  overridesHash = '',
  componentType = '',
  envFlags = {}
}) {
  const ch = codeHash || hash(code || '');
  const normPath = normalizePath(filePath || '');
  const envH = envFlagsHash(envFlags);
  const parts = [
    `code=${ch}`,
    `path=${normPath}`,
    `brand=${brandPackId || ''}@${brandVersion || ''}`,
    `engine=${engineVersion || ''}`,
    `rules=${rulesetVersion || ''}`,
    `overrides=${overridesHash}`,
    `component=${componentType}`,
    `env=${envH}`
  ];
  return hash(parts.join('|'));
}

module.exports = { computeSignature, envFlagsHash };

// Phase 5: pre-warm and TTL/eviction (in-memory demo)
class MemoryCache {
  constructor(ttlMs = 0) {
    this.ttlMs = ttlMs;
    this.map = new Map();
  }
  set(key, value) {
    const entry = { value, lastHit: Date.now() };
    this.map.set(key, entry);
  }
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (this.ttlMs > 0 && Date.now() - entry.lastHit > this.ttlMs) {
      this.map.delete(key);
      return undefined;
    }
    entry.lastHit = Date.now();
    return entry.value;
  }
  prewarm(entries = []) {
    for (const [k, v] of entries) this.set(k, v);
  }
  size() { return this.map.size; }
}

module.exports.MemoryCache = MemoryCache;

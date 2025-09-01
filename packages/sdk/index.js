const { enhanceCss } = require('../engine');
let resolveProjectContextInner;
try {
  ({ resolveProjectContext: resolveProjectContextInner } = require('../discovery'));
} catch {
  resolveProjectContextInner = async () => ({ degraded: true, mongoAvailable: false });
}
const { computeSignature } = require('../cache');

const _cache = new Map();

async function resolveProjectContext(projectPath) {
  return resolveProjectContextInner(projectPath);
}

function enhance({ code, tokens = {}, filePath = '' }) {
  return enhanceCss({ code, tokens, filePath });
}

function enhanceCached({ code, tokens = {}, filePath = '', brandPackId = '', brandVersion = '', engineVersion = '1.0.0', rulesetVersion = '1.0.0', overridesHash = '', componentType = '', envFlags = {} }) {
  const signature = computeSignature({ code, filePath, brandPackId, brandVersion, engineVersion, rulesetVersion, overridesHash, componentType, envFlags });
  const cached = _cache.get(signature);
  if (cached) {
    return { ...cached, cacheHit: true };
  }
  const res = enhanceCss({ code, tokens, filePath });
  const out = { code: res.code, changes: res.changes, cacheHit: false, signature };
  _cache.set(signature, out);
  return out;
}

function onStatus(cb, projectPath) {
  // Minimal: emit one-shot status from current context
  resolveProjectContext(projectPath).then((ctx) => {
    cb({ mongoAvailable: !!ctx.mongoAvailable, degraded: !!ctx.degraded, at: new Date().toISOString() });
  }).catch(() => cb({ mongoAvailable: false, degraded: true, at: new Date().toISOString() }));
}

module.exports = { resolveProjectContext, enhance, enhanceCached, onStatus };

// Level 3 automation (dev-only helper): process provided files and enhance in background
async function autoEnhance({ projectPath: _projectPath = process.cwd(), files = [], tokens = {}, reportPath = 'reports/sdk-auto.json' }) {
  const report = { startedAt: new Date().toISOString(), items: [] };
  for (const file of files) {
    try {
      const input = require('fs').readFileSync(file, 'utf8');
      const out = enhanceCached({ code: input, tokens, filePath: file, brandPackId: 'auto', brandVersion: '1.0.0' });
      report.items.push({ file, cacheHit: out.cacheHit, changes: out.changes.length });
    } catch (e) {
      report.items.push({ file, error: e.message });
    }
  }
  report.completedAt = new Date().toISOString();
  require('fs').mkdirSync(require('path').dirname(reportPath), { recursive: true });
  require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return report;
}

module.exports.autoEnhance = autoEnhance;

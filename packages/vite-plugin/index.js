const fs = require('fs');
const path = require('path');
const { enhanceCss } = require('../engine');
let resolveProjectContext;
try {
  // Optional: if discovery dependency unavailable, fall back gracefully
  ({ resolveProjectContext } = require('../discovery'));
} catch {
  resolveProjectContext = async () => ({ degraded: true, mongoAvailable: false });
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function loadTokens(projectRoot) {
  // Minimal: try lock file; otherwise empty tokens
  const p = path.join(projectRoot, '.agentic', 'brand-pack.lock.json');
  const lock = readJsonSafe(p);
  if (lock && lock.tokens) return lock.tokens;
  return {};
}

function agenticDesignPlugin(_opts = {}) {
  let projectRoot = process.cwd();
  const logPath = path.join(projectRoot, 'logs', 'plugin-tests.log');
  function log(line) {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, line + '\n');
  }
  return {
    name: 'agentic-design',
    apply: 'serve',
    enforce: 'pre',
    configResolved(config) {
      projectRoot = config.root || process.cwd();
      log(`[plugin] resolved root=${projectRoot}`);
    },
    async transform(code, id) {
      if (!id.endsWith('.css')) return null;
      if (id.includes('node_modules')) return null;
      const ctx = await resolveProjectContext(projectRoot);
      const tokens = loadTokens(projectRoot);
      const res = enhanceCss({ code, tokens, filePath: id });
      if (res.changes.length > 0) {
        log(`[plugin] transformed id=${id} changes=${res.changes.length} degraded=${ctx.degraded}`);
        return { code: res.code, map: null };
      }
      return null;
    }
  };
}

module.exports = { agenticDesignPlugin };

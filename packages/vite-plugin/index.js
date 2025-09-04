const fs = require('fs');
const path = require('path');
const { enhanceCss, enhanceJSX } = require('../engine');
const { enhanceCSSinJS } = require('../engine/css-in-js');
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
      // Skip node_modules and non-target files
      if (id.includes('node_modules')) return null;
      
      // Determine file type and enhancement function
      let enhanceFunction = null;
      let fileType = null;
      
      if (id.endsWith('.css')) {
        enhanceFunction = enhanceCss;
        fileType = 'css';
      } else if (id.endsWith('.jsx') || id.endsWith('.tsx')) {
        enhanceFunction = enhanceJSX;
        fileType = 'jsx';
      } else if (id.endsWith('.js') || id.endsWith('.ts')) {
        // Check if JS/TS file contains CSS-in-JS patterns
        if (this.containsCSSinJS(code)) {
          enhanceFunction = enhanceCSSinJS;
          fileType = 'css-in-js';
        }
      }
      
      if (!enhanceFunction) return null;
      
      const ctx = await resolveProjectContext(projectRoot);
      const tokens = loadTokens(projectRoot);
      const res = enhanceFunction({ code, tokens, filePath: id });
      
      // Handle different response formats from different enhancers
      const hasChanges = res.changes && res.changes.length > 0;
      const resultCode = res.code || code;
      
      if (hasChanges && resultCode !== code) {
        log(`[plugin] transformed id=${id} type=${fileType} changes=${res.changes?.length || 0} degraded=${ctx.degraded}`);
        return { code: resultCode, map: null };
      }
      
      return null;
    },
    
    containsCSSinJS(code) {
      // Enhanced pattern detection for CSS-in-JS
      return /styled\.[a-zA-Z]+`/.test(code) ||          // styled.button`
             /css`/.test(code) ||                         // css`
             /\bcss\s*\(/.test(code) ||                   // css(
             /@emotion\/styled|@emotion\/css|styled-components/.test(code) || // imports
             /import.*styled.*from/.test(code) ||        // import styled
             /import.*css.*from.*@emotion/.test(code);   // emotion imports
    }
  };
}

module.exports = { agenticDesignPlugin };

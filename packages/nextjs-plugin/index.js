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
  // Try lock file first, then other discovery methods
  const lockPath = path.join(projectRoot, '.agentic', 'brand-pack.lock.json');
  const lock = readJsonSafe(lockPath);
  if (lock && lock.tokens) return lock.tokens;
  
  // Fallback to package.json agentic field
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = readJsonSafe(pkgPath);
  if (pkg && pkg.agentic && pkg.agentic.tokens) return pkg.agentic.tokens;
  
  return {};
}

/**
 * Next.js plugin for Agentic Design transformation
 * Integrates with Next.js webpack configuration
 */
function withAgenticDesign(nextConfig = {}) {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      // Add our custom loader for CSS, JSX, and CSS-in-JS files
      config.module.rules.push({
        test: /\.(css|jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.join(__dirname, 'loader.js'),
            options: {
              projectRoot: options.dir,
              isDev: options.dev,
              isServer: options.isServer
            }
          }
        ]
      });

      // Call the user's webpack function if it exists
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  });
}

/**
 * Standalone enhancement function for Next.js projects
 * Can be used in API routes or server-side processing
 */
async function enhanceWithNextjs({ code, filePath, projectRoot = process.cwd() }) {
  const tokens = loadTokens(projectRoot);
  const ext = path.extname(filePath).toLowerCase();
  
  let enhanceFunction = null;
  let fileType = null;
  
  if (ext === '.css') {
    enhanceFunction = enhanceCss;
    fileType = 'css';
  } else if (ext === '.jsx' || ext === '.tsx') {
    enhanceFunction = enhanceJSX;
    fileType = 'jsx';
  } else if (ext === '.js' || ext === '.ts') {
    // Check for CSS-in-JS patterns
    if (containsCSSinJS(code)) {
      enhanceFunction = enhanceCSSinJS;
      fileType = 'css-in-js';
    }
  }
  
  if (!enhanceFunction) {
    return { code, changes: [], success: true, skipped: 'unsupported-file-type' };
  }
  
  try {
    const result = enhanceFunction({ code, tokens, filePath });
    return {
      ...result,
      fileType,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('[Agentic Design] Enhancement error:', error.message);
    return { code, changes: [], success: false, error: error.message };
  }
}

function containsCSSinJS(code) {
  // Enhanced pattern detection for CSS-in-JS
  return /styled\.[a-zA-Z]+`/.test(code) ||
         /css`/.test(code) ||
         /\bcss\s*\(/.test(code) ||
         /@emotion\/styled|@emotion\/css|styled-components/.test(code) ||
         /import.*styled.*from/.test(code);
}

module.exports = {
  withAgenticDesign,
  enhanceWithNextjs,
  loadTokens,
  containsCSSinJS
};
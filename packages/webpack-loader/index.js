const fs = require('fs');
const path = require('path');
const { enhanceCss, enhanceJSX } = require('../engine');
const { enhanceCSSinJS } = require('../engine/css-in-js');

let resolveProjectContext;
try {
  ({ resolveProjectContext } = require('../discovery'));
} catch {
  resolveProjectContext = async () => ({ degraded: true, mongoAvailable: false });
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function loadTokens(projectRoot) {
  // Multiple discovery strategies
  const lockPath = path.join(projectRoot, '.agentic', 'brand-pack.lock.json');
  const lock = readJsonSafe(lockPath);
  if (lock && lock.tokens) return lock.tokens;
  
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = readJsonSafe(pkgPath);
  if (pkg && pkg.agentic && pkg.agentic.tokens) return pkg.agentic.tokens;
  
  return {};
}

function containsCSSinJS(code) {
  // Comprehensive CSS-in-JS detection
  return /styled\.[a-zA-Z]+`/.test(code) ||
         /css`/.test(code) ||
         /\bcss\s*\(/.test(code) ||
         /@emotion\/styled|@emotion\/css|styled-components/.test(code) ||
         /import.*styled.*from/.test(code) ||
         /template\s*literal.*(?:background|color|padding|margin)/i.test(code);
}

/**
 * Webpack loader for Agentic Design system
 * Transforms CSS, JSX, and CSS-in-JS files with design tokens at build time
 */
module.exports = function agenticDesignWebpackLoader(source) {
  const callback = this.async();
  const options = this.getOptions() || {};
  const resourcePath = this.resourcePath;
  
  // Find project root
  let projectRoot = options.projectRoot || process.cwd();
  if (!projectRoot) {
    // Try to find project root by looking for package.json
    let currentDir = path.dirname(resourcePath);
    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        projectRoot = currentDir;
        break;
      }
      currentDir = path.dirname(currentDir);
    }
  }
  
  // Skip node_modules and build directories
  if (resourcePath.includes('node_modules') || 
      resourcePath.includes('/dist/') ||
      resourcePath.includes('\\dist\\') ||
      resourcePath.includes('/.next/') ||
      resourcePath.includes('\\.next\\')) {
    return callback(null, source);
  }
  
  // Determine enhancement function based on file extension
  const ext = path.extname(resourcePath).toLowerCase();
  let enhanceFunction = null;
  let fileType = null;
  
  if (ext === '.css') {
    enhanceFunction = enhanceCss;
    fileType = 'css';
  } else if (ext === '.jsx' || ext === '.tsx') {
    enhanceFunction = enhanceJSX;
    fileType = 'jsx';
  } else if (ext === '.js' || ext === '.ts') {
    if (containsCSSinJS(source)) {
      enhanceFunction = enhanceCSSinJS;
      fileType = 'css-in-js';
    }
  }
  
  if (!enhanceFunction) {
    return callback(null, source);
  }
  
  // Load tokens for the project
  const tokens = loadTokens(projectRoot);
  
  try {
    const result = enhanceFunction({
      code: source,
      tokens,
      filePath: resourcePath,
      maxChanges: options.maxChanges || 10
    });
    
    if (result.success && result.changes && result.changes.length > 0) {
      // Log in development mode
      if (options.development || process.env.NODE_ENV === 'development') {
        console.log(`[Agentic Design] Enhanced ${path.relative(projectRoot, resourcePath)} (${result.fileType || fileType}, ${result.changes.length} changes)`);
      }
      
      // Add transformation metadata as comment
      const metadata = `\n/* Agentic Design: ${result.changes.length} token transformations applied */`;
      const enhancedSource = result.code + (fileType === 'css' ? metadata : '');
      
      callback(null, enhancedSource);
    } else {
      // No changes or enhancement failed
      if (result.error && (options.development || process.env.NODE_ENV === 'development')) {
        console.warn(`[Agentic Design] Enhancement failed for ${path.relative(projectRoot, resourcePath)}: ${result.error}`);
      }
      callback(null, source);
    }
  } catch (error) {
    console.error(`[Agentic Design] Loader error for ${path.relative(projectRoot, resourcePath)}:`, error);
    // Return original source to not break build
    callback(null, source);
  }
};

/**
 * Helper function for webpack configuration
 * Simplifies integration into webpack config
 */
function createAgenticRule(options = {}) {
  return {
    test: /\.(css|jsx?|tsx?)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: require.resolve('./index.js'),
        options: {
          development: process.env.NODE_ENV === 'development',
          maxChanges: 10,
          ...options
        }
      }
    ]
  };
}

module.exports.createAgenticRule = createAgenticRule;
module.exports.loadTokens = loadTokens;
module.exports.containsCSSinJS = containsCSSinJS;
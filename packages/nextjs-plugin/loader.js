const path = require('path');
const { enhanceWithNextjs } = require('./index');

/**
 * Webpack loader for Agentic Design enhancement
 * Transforms CSS, JSX, and CSS-in-JS files with design tokens
 */
module.exports = function agenticDesignLoader(source) {
  const callback = this.async();
  const options = this.getOptions() || {};
  
  // Skip processing in server builds to avoid hydration mismatches
  if (options.isServer) {
    return callback(null, source);
  }
  
  const resourcePath = this.resourcePath;
  const projectRoot = options.projectRoot || process.cwd();
  
  // Skip node_modules and specific paths
  if (resourcePath.includes('node_modules') || 
      resourcePath.includes('/.next/') ||
      resourcePath.includes('\\dist\\')) {
    return callback(null, source);
  }
  
  // Process the source with Agentic Design enhancement
  enhanceWithNextjs({
    code: source,
    filePath: resourcePath,
    projectRoot
  }).then(result => {
    if (result.success && result.changes && result.changes.length > 0) {
      // Log transformation in development mode
      if (options.isDev) {
        console.log(`[Agentic Design] Enhanced ${path.relative(projectRoot, resourcePath)} (${result.changes.length} changes)`);
      }
      
      // Add source map comment if we have changes
      const sourceMapComment = result.fileType === 'css' 
        ? `\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from('{}').toString('base64')} */`
        : '';
        
      callback(null, result.code + sourceMapComment);
    } else {
      // No changes or enhancement failed, return original source
      if (result.error && options.isDev) {
        console.warn(`[Agentic Design] Enhancement failed for ${path.relative(projectRoot, resourcePath)}: ${result.error}`);
      }
      callback(null, source);
    }
  }).catch(error => {
    if (options.isDev) {
      console.error(`[Agentic Design] Loader error for ${path.relative(projectRoot, resourcePath)}:`, error);
    }
    // Return original source on error to not break the build
    callback(null, source);
  });
};

// Mark as raw loader to handle binary content correctly
module.exports.raw = false;
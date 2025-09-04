// File Watcher Service - Monitor project files for design system changes
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const chokidar = require('chokidar');

class FileWatcherService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      watchPatterns: ['**/*.css', '**/*.html', '**/*.jsx', '**/*.tsx', '**/*.vue'],
      ignorePaths: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
      debounceMs: 300,
      ...options
    };
    this.watcher = null;
    this.debounceTimers = new Map();
  }

  start(projectPath = process.cwd()) {
    if (this.watcher) {
      this.stop();
    }

    const watchPaths = this.options.watchPatterns.map(pattern => 
      path.join(projectPath, pattern)
    );

    this.watcher = chokidar.watch(watchPaths, {
      ignored: this.options.ignorePaths,
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    });

    this.watcher.on('change', (filePath) => {
      this.debouncedEmit('file:changed', filePath);
    });

    this.watcher.on('add', (filePath) => {
      this.debouncedEmit('file:added', filePath);
    });

    this.watcher.on('unlink', (filePath) => {
      this.debouncedEmit('file:removed', filePath);
    });

    this.watcher.on('error', (error) => {
      this.emit('error', error);
    });

    this.emit('watcher:started', { projectPath, patterns: this.options.watchPatterns });
    return this;
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.debounceTimers.clear();
      this.emit('watcher:stopped');
    }
  }

  debouncedEmit(event, filePath) {
    const key = `${event}:${filePath}`;
    
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      
      // Determine file type and enhancement relevance
      const fileInfo = this.analyzeFile(filePath);
      
      this.emit(event, {
        path: filePath,
        type: fileInfo.type,
        needsEnhancement: fileInfo.needsEnhancement,
        timestamp: new Date().toISOString()
      });

      // Emit specific events for different file types
      if (fileInfo.needsEnhancement) {
        this.emit('enhancement:candidate', {
          path: filePath,
          type: fileInfo.type,
          reason: fileInfo.reason
        });
      }

    }, this.options.debounceMs);

    this.debounceTimers.set(key, timer);
  }

  analyzeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath);
    
    let type = 'unknown';
    let needsEnhancement = false;
    let reason = null;

    switch (ext) {
      case '.css':
        type = 'stylesheet';
        needsEnhancement = true;
        reason = 'CSS file - potential brand token opportunities';
        break;
      case '.html':
        type = 'markup';
        needsEnhancement = true;
        reason = 'HTML file - semantic analysis and accessibility checks';
        break;
      case '.jsx':
      case '.tsx':
        type = 'component';
        needsEnhancement = this.hasInlineStyles(filePath);
        reason = needsEnhancement ? 'Component with inline styles detected' : null;
        break;
      case '.vue':
        type = 'component';
        needsEnhancement = this.hasStyleSection(filePath);
        reason = needsEnhancement ? 'Vue component with style section' : null;
        break;
      case '.js':
      case '.ts':
        if (basename.includes('style') || basename.includes('theme')) {
          type = 'config';
          needsEnhancement = true;
          reason = 'Style/theme configuration file';
        }
        break;
    }

    // Check for excluded files
    const excluded = /\.min\.|vendor|generated|node_modules/i.test(filePath);
    if (excluded) {
      needsEnhancement = false;
      reason = null;
    }

    return { type, needsEnhancement, reason };
  }

  hasInlineStyles(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Check for styled-components, emotion, or inline style props
      return /styled\.|css`|style={{|sx={{/.test(content);
    } catch {
      return false;
    }
  }

  hasStyleSection(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return /<style[^>]*>/.test(content);
    } catch {
      return false;
    }
  }

  // Get current watch statistics
  getStats() {
    return {
      isWatching: !!this.watcher,
      watchedPaths: this.watcher?.getWatched() || {},
      pendingDebounce: this.debounceTimers.size,
      options: this.options
    };
  }
}

module.exports = { FileWatcherService };
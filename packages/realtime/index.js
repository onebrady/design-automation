// Real-time Agent Integration - Main orchestrator for file watching, WebSocket communication, and streaming enhancements
const EventEmitter = require('events');
const { FileWatcherService } = require('./file-watcher');
const { WebSocketServer } = require('./websocket-server');
const { StreamingEnhancementService } = require('./streaming');

class RealtimeService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      fileWatcher: {
        watchPatterns: ['**/*.css', '**/*.html', '**/*.jsx', '**/*.tsx'],
        debounceMs: 300,
        ...options.fileWatcher
      },
      webSocket: {
        port: 8902,
        maxConnections: 50,
        ...options.webSocket
      },
      streaming: {
        chunkSize: 1024,
        delayMs: 50,
        ...options.streaming
      },
      enableAutoEnhancement: true,
      projectPath: process.cwd(),
      ...options
    };

    // Initialize services
    this.fileWatcher = new FileWatcherService(this.options.fileWatcher);
    this.webSocketServer = new WebSocketServer(this.options.webSocket);
    this.streamingService = new StreamingEnhancementService(this.options.streaming);

    this.isRunning = false;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // File watcher events
    this.fileWatcher.on('file:changed', (fileInfo) => {
      this.handleFileChange(fileInfo);
    });

    this.fileWatcher.on('enhancement:candidate', (fileInfo) => {
      this.handleEnhancementCandidate(fileInfo);
    });

    this.fileWatcher.on('error', (error) => {
      this.emit('error', { source: 'file-watcher', error });
    });

    // WebSocket server events
    this.webSocketServer.on('client:connected', (data) => {
      this.emit('client:connected', data);
    });

    this.webSocketServer.on('enhancement:requested', (data) => {
      this.handleEnhancementRequest(data);
    });

    this.webSocketServer.on('file:watch_requested', (data) => {
      this.handleFileWatchRequest(data);
    });

    this.webSocketServer.on('server:started', () => {
      this.emit('websocket:ready', { port: this.options.webSocket.port });
    });
  }

  async start(projectPath = null) {
    if (this.isRunning) {
      throw new Error('Realtime service is already running');
    }

    const actualProjectPath = projectPath || this.options.projectPath;

    try {
      // Start file watcher
      this.fileWatcher.start(actualProjectPath);
      
      // Start WebSocket server
      this.webSocketServer.start();
      
      this.isRunning = true;
      this.emit('service:started', { 
        projectPath: actualProjectPath,
        websocketPort: this.options.webSocket.port
      });

      return {
        fileWatcher: true,
        webSocket: true,
        projectPath: actualProjectPath
      };

    } catch (error) {
      this.emit('error', { source: 'startup', error });
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) return;

    try {
      this.fileWatcher.stop();
      this.webSocketServer.stop();
      
      this.isRunning = false;
      this.emit('service:stopped');

    } catch (error) {
      this.emit('error', { source: 'shutdown', error });
      throw error;
    }
  }

  async handleFileChange(fileInfo) {
    // Broadcast file change to all connected clients
    this.webSocketServer.broadcast({
      type: 'file:changed',
      file: fileInfo.path,
      fileType: fileInfo.type,
      needsEnhancement: fileInfo.needsEnhancement,
      timestamp: fileInfo.timestamp
    });

    this.emit('file:changed', fileInfo);
  }

  async handleEnhancementCandidate(fileInfo) {
    if (!this.options.enableAutoEnhancement) return;

    try {
      // Read file content
      const fs = require('fs');
      const code = fs.readFileSync(fileInfo.path, 'utf8');
      
      // Get project context for tokens
      const { resolveProjectContext } = require('../discovery');
      const context = await resolveProjectContext(this.options.projectPath);
      
      let tokens = {};
      if (context.brandPack?.id) {
        try {
          const http = require('http');
          const response = await this.makeHttpRequest(`http://localhost:8901/api/brand-packs/${context.brandPack.id}/export/json`);
          tokens = response.tokens || {};
        } catch (err) {
          console.warn('Could not fetch brand pack tokens:', err.message);
        }
      }

      // Create streaming enhancement
      const enhancementStream = await this.streamingService.createEnhancementStream(
        code,
        tokens,
        { filePath: fileInfo.path }
      );

      // Broadcast enhancement stream to relevant clients
      const room = `project:${context.projectId || 'default'}`;
      
      this.webSocketServer.broadcastToRoom(room, {
        type: 'enhancement:auto_start',
        file: fileInfo.path,
        reason: fileInfo.reason,
        timestamp: new Date().toISOString()
      });

      enhancementStream.on('data', (chunk) => {
        const data = JSON.parse(chunk.toString());
        this.webSocketServer.broadcastToRoom(room, {
          type: 'enhancement:auto_data',
          file: fileInfo.path,
          ...data
        });
      });

      enhancementStream.on('end', () => {
        this.webSocketServer.broadcastToRoom(room, {
          type: 'enhancement:auto_complete',
          file: fileInfo.path,
          timestamp: new Date().toISOString()
        });
      });

    } catch (error) {
      this.emit('error', { source: 'auto-enhancement', error, file: fileInfo.path });
    }
  }

  async handleEnhancementRequest(data) {
    const { clientId, code, filePath, options, requestId } = data;

    try {
      // Get tokens from project context
      let tokens = {};
      if (options.useProjectTokens !== false) {
        const { resolveProjectContext } = require('../discovery');
        const context = await resolveProjectContext(this.options.projectPath);
        
        if (context.brandPack?.id) {
          try {
            const response = await this.makeHttpRequest(`http://localhost:8901/api/brand-packs/${context.brandPack.id}/export/json`);
            tokens = response.tokens || {};
          } catch (err) {
            console.warn('Could not fetch brand pack tokens for request:', err.message);
          }
        }
      }

      // Create and stream enhancement
      const enhancementStream = await this.streamingService.createEnhancementStream(
        code,
        tokens,
        { filePath, ...options }
      );

      this.webSocketServer.streamEnhancement(clientId, requestId, enhancementStream);

    } catch (error) {
      this.webSocketServer.send(clientId, {
        type: 'enhancement:error',
        requestId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleFileWatchRequest(data) {
    const { clientId, action, filePath, patterns } = data;

    switch (action) {
      case 'start':
        // Join project-specific room for file updates
        const room = `project:files`;
        this.webSocketServer.joinRoom(clientId, room, { watching: patterns || ['**/*'] });
        break;

      case 'stop':
        // Leave file watching room
        this.webSocketServer.leaveRoom(clientId, 'project:files');
        break;

      case 'status':
        // Send current watcher status
        this.webSocketServer.send(clientId, {
          type: 'file:watch_status',
          status: this.fileWatcher.getStats(),
          timestamp: new Date().toISOString()
        });
        break;
    }
  }

  // Helper for HTTP requests
  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const http = require('http');
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  // Get comprehensive service statistics
  getStats() {
    return {
      isRunning: this.isRunning,
      projectPath: this.options.projectPath,
      fileWatcher: this.fileWatcher.getStats(),
      webSocket: this.webSocketServer.getStats(),
      streaming: this.streamingService.getStats(),
      options: this.options
    };
  }

  // Broadcast a message to all clients in a project
  broadcastToProject(projectId, message) {
    const room = `project:${projectId || 'default'}`;
    return this.webSocketServer.broadcastToRoom(room, message);
  }

  // Send enhancement preview to specific client
  async sendEnhancementPreview(clientId, code, tokens = {}, options = {}) {
    try {
      const { enhanceCss } = require('../engine');
      const result = enhanceCss({ 
        code, 
        tokens, 
        filePath: options.filePath || '',
        maxChanges: options.maxChanges || 5
      });

      this.webSocketServer.send(clientId, {
        type: 'enhancement:preview',
        result,
        options,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.webSocketServer.send(clientId, {
        type: 'enhancement:preview_error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = { 
  RealtimeService,
  FileWatcherService,
  WebSocketServer,
  StreamingEnhancementService
};
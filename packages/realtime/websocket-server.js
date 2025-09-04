// WebSocket Server - Real-time bi-directional communication for design system
const EventEmitter = require('events');
const { v4: uuidv4 } = require('crypto');
const WebSocket = require('ws');

class WebSocketServer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      port: 8902,
      heartbeatInterval: 30000, // 30s
      maxConnections: 100,
      ...options
    };
    
    this.server = null;
    this.clients = new Map();
    this.rooms = new Map();
    this.heartbeatTimer = null;
  }

  start() {
    this.server = new WebSocket.Server({ 
      port: this.options.port,
      verifyClient: this.verifyClient.bind(this)
    });

    this.server.on('connection', (ws, req) => {
      const clientId = uuidv4();
      const client = {
        id: clientId,
        ws,
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        connectedAt: new Date(),
        lastPing: new Date(),
        rooms: new Set(),
        metadata: {}
      };

      this.clients.set(clientId, client);
      ws.clientId = clientId;

      // Send welcome message with client ID
      this.send(clientId, {
        type: 'connection:established',
        clientId,
        timestamp: new Date().toISOString()
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          this.send(clientId, {
            type: 'error',
            error: 'Invalid JSON message format',
            timestamp: new Date().toISOString()
          });
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        this.emit('client:error', { clientId, error });
      });

      this.emit('client:connected', { clientId, client });
    });

    // Start heartbeat system
    this.startHeartbeat();

    this.emit('server:started', { port: this.options.port });
    return this;
  }

  stop() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.server) {
      // Close all client connections
      this.clients.forEach((client) => {
        client.ws.close();
      });
      
      this.server.close();
      this.server = null;
      this.clients.clear();
      this.rooms.clear();
    }

    this.emit('server:stopped');
  }

  verifyClient(info) {
    // Basic connection limits
    if (this.clients.size >= this.options.maxConnections) {
      return false;
    }
    return true;
  }

  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastPing = new Date();

    switch (message.type) {
      case 'ping':
        this.send(clientId, { type: 'pong', timestamp: new Date().toISOString() });
        break;

      case 'room:join':
        this.joinRoom(clientId, message.room, message.metadata);
        break;

      case 'room:leave':
        this.leaveRoom(clientId, message.room);
        break;

      case 'enhancement:request':
        this.handleEnhancementRequest(clientId, message);
        break;

      case 'file:watch':
        this.handleFileWatchRequest(clientId, message);
        break;

      case 'client:metadata':
        this.updateClientMetadata(clientId, message.metadata);
        break;

      default:
        this.emit('message:unknown', { clientId, message });
    }

    this.emit('message:received', { clientId, message });
  }

  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      // Leave all rooms
      client.rooms.forEach(room => {
        this.leaveRoom(clientId, room);
      });
      
      this.clients.delete(clientId);
      this.emit('client:disconnected', { clientId, client });
    }
  }

  // Room management
  joinRoom(clientId, roomName, metadata = {}) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }

    this.rooms.get(roomName).add(clientId);
    client.rooms.add(roomName);
    client.metadata.rooms = client.metadata.rooms || {};
    client.metadata.rooms[roomName] = metadata;

    this.send(clientId, {
      type: 'room:joined',
      room: roomName,
      members: this.rooms.get(roomName).size,
      timestamp: new Date().toISOString()
    });

    // Notify other room members
    this.broadcastToRoom(roomName, {
      type: 'room:member_joined',
      room: roomName,
      clientId,
      members: this.rooms.get(roomName).size
    }, [clientId]);

    this.emit('room:joined', { clientId, room: roomName, metadata });
  }

  leaveRoom(clientId, roomName) {
    const client = this.clients.get(clientId);
    if (!client || !client.rooms.has(roomName)) return;

    const room = this.rooms.get(roomName);
    if (room) {
      room.delete(clientId);
      if (room.size === 0) {
        this.rooms.delete(roomName);
      } else {
        // Notify remaining members
        this.broadcastToRoom(roomName, {
          type: 'room:member_left',
          room: roomName,
          clientId,
          members: room.size
        });
      }
    }

    client.rooms.delete(roomName);
    if (client.metadata.rooms) {
      delete client.metadata.rooms[roomName];
    }

    this.send(clientId, {
      type: 'room:left',
      room: roomName,
      timestamp: new Date().toISOString()
    });

    this.emit('room:left', { clientId, room: roomName });
  }

  // Enhancement request handling
  handleEnhancementRequest(clientId, message) {
    const { code, filePath, options = {} } = message;
    
    this.emit('enhancement:requested', {
      clientId,
      code,
      filePath,
      options,
      requestId: message.requestId || uuidv4()
    });
  }

  // File watching requests
  handleFileWatchRequest(clientId, message) {
    const { action, filePath, patterns } = message;
    
    this.emit('file:watch_requested', {
      clientId,
      action, // 'start', 'stop', 'status'
      filePath,
      patterns
    });
  }

  updateClientMetadata(clientId, metadata) {
    const client = this.clients.get(clientId);
    if (client) {
      client.metadata = { ...client.metadata, ...metadata };
      this.emit('client:metadata_updated', { clientId, metadata: client.metadata });
    }
  }

  // Send message to specific client
  send(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify({
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        }));
        return true;
      } catch (error) {
        this.emit('send:error', { clientId, error });
        return false;
      }
    }
    return false;
  }

  // Broadcast to all clients
  broadcast(message, exclude = []) {
    let sent = 0;
    this.clients.forEach((client, clientId) => {
      if (!exclude.includes(clientId)) {
        if (this.send(clientId, message)) {
          sent++;
        }
      }
    });
    return sent;
  }

  // Broadcast to room members
  broadcastToRoom(roomName, message, exclude = []) {
    const room = this.rooms.get(roomName);
    if (!room) return 0;

    let sent = 0;
    room.forEach(clientId => {
      if (!exclude.includes(clientId)) {
        if (this.send(clientId, message)) {
          sent++;
        }
      }
    });
    return sent;
  }

  // Stream enhancement results progressively
  streamEnhancement(clientId, requestId, stream) {
    const startTime = Date.now();
    let chunkCount = 0;

    this.send(clientId, {
      type: 'enhancement:stream_start',
      requestId,
      timestamp: new Date().toISOString()
    });

    stream.on('data', (chunk) => {
      chunkCount++;
      this.send(clientId, {
        type: 'enhancement:stream_data',
        requestId,
        chunk: chunk.toString(),
        chunkIndex: chunkCount,
        timestamp: new Date().toISOString()
      });
    });

    stream.on('end', () => {
      const duration = Date.now() - startTime;
      this.send(clientId, {
        type: 'enhancement:stream_complete',
        requestId,
        chunks: chunkCount,
        duration,
        timestamp: new Date().toISOString()
      });
    });

    stream.on('error', (error) => {
      this.send(clientId, {
        type: 'enhancement:stream_error',
        requestId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      const now = new Date();
      const staleThreshold = 60000; // 60s

      this.clients.forEach((client, clientId) => {
        const timeSinceLastPing = now - client.lastPing;
        
        if (timeSinceLastPing > staleThreshold) {
          // Client seems stale, close connection
          client.ws.close();
          this.handleDisconnect(clientId);
        } else {
          // Send heartbeat ping
          this.send(clientId, { type: 'heartbeat', timestamp: now.toISOString() });
        }
      });
    }, this.options.heartbeatInterval);
  }

  // Get server statistics
  getStats() {
    return {
      isRunning: !!this.server,
      port: this.options.port,
      connections: this.clients.size,
      rooms: this.rooms.size,
      clients: Array.from(this.clients.values()).map(client => ({
        id: client.id,
        ip: client.ip,
        connectedAt: client.connectedAt,
        rooms: Array.from(client.rooms),
        metadata: client.metadata
      })),
      roomStats: Array.from(this.rooms.entries()).map(([name, members]) => ({
        name,
        members: members.size
      }))
    };
  }
}

module.exports = { WebSocketServer };
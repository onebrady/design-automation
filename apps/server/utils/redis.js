const Redis = require('ioredis');

// Redis connection configuration
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || null;

// Initialize Redis client with retry strategy
const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const targetErrors = ['READONLY', 'CONNECTION_BROKEN'];
    if (targetErrors.some(e => err.message.includes(e))) {
      return true;
    }
    return false;
  }
});

// Redis health check
async function redisHealth() {
  try {
    await redis.ping();
    return { 
      redisAvailable: true, 
      lastOkAt: new Date().toISOString(),
      connection: {
        host: redisHost,
        port: redisPort
      }
    };
  } catch (error) {
    console.error('Redis health check failed:', error.message);
    return { 
      redisAvailable: false, 
      lastOkAt: null,
      error: error.message 
    };
  }
}

// Redis data layer class for brand pack and cache operations
class RedisDataLayer {
  constructor() {
    this.redis = redis;
    this.keyPrefix = {
      brandPack: 'bp:',
      brandPackList: 'bplist',
      cache: 'cache:',
      pattern: 'pattern:',
      lock: 'lock:',
      version: 'ver:'
    };
  }

  // ==================== Brand Pack Operations ====================
  
  async getBrandPack(id) {
    try {
      const key = `${this.keyPrefix.brandPack}${id}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting brand pack:', error.message);
      return null;
    }
  }

  async saveBrandPack(id, data) {
    try {
      const key = `${this.keyPrefix.brandPack}${id}`;
      const success = await this.redis.set(key, JSON.stringify(data));
      
      // Add to brand pack list for enumeration
      await this.redis.sadd(this.keyPrefix.brandPackList, id);
      
      // Store version separately for version management
      if (data.version) {
        const versionKey = `${this.keyPrefix.version}${id}:${data.version}`;
        await this.redis.set(versionKey, JSON.stringify(data));
      }
      
      return success === 'OK';
    } catch (error) {
      console.error('Error saving brand pack:', error.message);
      return false;
    }
  }

  async getAllBrandPacks() {
    try {
      const ids = await this.redis.smembers(this.keyPrefix.brandPackList);
      const packs = await Promise.all(
        ids.map(id => this.getBrandPack(id))
      );
      return packs.filter(pack => pack !== null);
    } catch (error) {
      console.error('Error getting all brand packs:', error.message);
      return [];
    }
  }

  async deleteBrandPack(id) {
    try {
      const key = `${this.keyPrefix.brandPack}${id}`;
      await this.redis.del(key);
      await this.redis.srem(this.keyPrefix.brandPackList, id);
      
      // Clean up versions
      const versionKeys = await this.redis.keys(`${this.keyPrefix.version}${id}:*`);
      if (versionKeys.length > 0) {
        await this.redis.del(...versionKeys);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting brand pack:', error.message);
      return false;
    }
  }

  // ==================== Cache Operations ====================
  
  async cacheGet(signature) {
    try {
      const key = `${this.keyPrefix.cache}${signature}`;
      const data = await this.redis.get(key);
      
      if (data) {
        // Update last access time for LRU tracking
        await this.redis.expire(key, 86400); // Refresh TTL to 24 hours
        return JSON.parse(data);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cache:', error.message);
      return null;
    }
  }

  async cachePut(signature, data, ttl = 3600) {
    try {
      const key = `${this.keyPrefix.cache}${signature}`;
      const success = await this.redis.setex(key, ttl, JSON.stringify(data));
      return success === 'OK';
    } catch (error) {
      console.error('Error putting cache:', error.message);
      return false;
    }
  }

  async cacheDelete(signature) {
    try {
      const key = `${this.keyPrefix.cache}${signature}`;
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Error deleting cache:', error.message);
      return false;
    }
  }

  async cacheClear() {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix.cache}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error.message);
      return false;
    }
  }

  async getCacheStats() {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix.cache}*`);
      const info = await this.redis.info('memory');
      const memoryUsed = info.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'unknown';
      
      return {
        entries: keys.length,
        memoryUsed,
        oldestKey: null, // Could be implemented with additional tracking
        hitRate: null // Would need to implement hit/miss tracking
      };
    } catch (error) {
      console.error('Error getting cache stats:', error.message);
      return {
        entries: 0,
        memoryUsed: 'unknown',
        error: error.message
      };
    }
  }

  // ==================== Pattern Operations ====================
  
  async getPattern(projectId, patternId) {
    try {
      const key = `${this.keyPrefix.pattern}${projectId}:${patternId}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting pattern:', error.message);
      return null;
    }
  }

  async savePattern(projectId, patternId, data) {
    try {
      const key = `${this.keyPrefix.pattern}${projectId}:${patternId}`;
      const success = await this.redis.set(key, JSON.stringify({
        ...data,
        lastSeen: new Date().toISOString()
      }));
      
      // Set TTL of 90 days for patterns
      await this.redis.expire(key, 7776000);
      
      return success === 'OK';
    } catch (error) {
      console.error('Error saving pattern:', error.message);
      return false;
    }
  }

  async getProjectPatterns(projectId) {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix.pattern}${projectId}:*`);
      const patterns = await Promise.all(
        keys.map(async (key) => {
          const data = await this.redis.get(key);
          return data ? JSON.parse(data) : null;
        })
      );
      return patterns.filter(pattern => pattern !== null);
    } catch (error) {
      console.error('Error getting project patterns:', error.message);
      return [];
    }
  }

  // ==================== Lock Operations (for distributed systems) ====================
  
  async acquireLock(resource, ttl = 5000) {
    try {
      const key = `${this.keyPrefix.lock}${resource}`;
      const lockId = Date.now().toString();
      const result = await this.redis.set(key, lockId, 'PX', ttl, 'NX');
      return result === 'OK' ? lockId : null;
    } catch (error) {
      console.error('Error acquiring lock:', error.message);
      return null;
    }
  }

  async releaseLock(resource, lockId) {
    try {
      const key = `${this.keyPrefix.lock}${resource}`;
      const currentLock = await this.redis.get(key);
      
      if (currentLock === lockId) {
        await this.redis.del(key);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error releasing lock:', error.message);
      return false;
    }
  }

  // ==================== Migration Helper ====================
  
  async migrateFromMongoDB(mongoData) {
    try {
      const results = {
        brandPacks: { success: 0, failed: 0 },
        patterns: { success: 0, failed: 0 }
      };

      // Migrate brand packs
      if (mongoData.brandPacks && Array.isArray(mongoData.brandPacks)) {
        for (const pack of mongoData.brandPacks) {
          const success = await this.saveBrandPack(pack.id, pack);
          if (success) {
            results.brandPacks.success++;
          } else {
            results.brandPacks.failed++;
          }
        }
      }

      // Migrate patterns
      if (mongoData.patterns && Array.isArray(mongoData.patterns)) {
        for (const pattern of mongoData.patterns) {
          const success = await this.savePattern(
            pattern.projectId, 
            pattern.pattern?.id || pattern.id,
            pattern.pattern || pattern
          );
          if (success) {
            results.patterns.success++;
          } else {
            results.patterns.failed++;
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Migration error:', error.message);
      throw error;
    }
  }

  // ==================== Cleanup ====================
  
  async close() {
    try {
      await this.redis.quit();
      return true;
    } catch (error) {
      console.error('Error closing Redis connection:', error.message);
      return false;
    }
  }
}

// Singleton instance
let dataLayerInstance = null;

function getRedisDataLayer() {
  if (!dataLayerInstance) {
    dataLayerInstance = new RedisDataLayer();
  }
  return dataLayerInstance;
}

// Connect to Redis on module load
redis.connect().then(() => {
  console.log('Redis connected successfully');
}).catch((err) => {
  console.error('Redis connection error:', err.message);
});

module.exports = {
  redisHealth,
  RedisDataLayer,
  getRedisDataLayer,
  redis
};
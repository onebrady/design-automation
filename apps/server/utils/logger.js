/**
 * Structured Logging Utility with Winston
 * 
 * Provides consistent, production-grade logging across the API server
 * with structured JSON format, multiple log levels, and contextual metadata.
 */

const winston = require('winston');
const path = require('path');

// Define log levels and their priority
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'blue',
  debug: 'gray',
};

winston.addColors(logColors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} ${level}: ${message} ${metaString}`;
  })
);

// Create Winston logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
    }),
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
    }),
  ],
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Enhanced logger with contextual methods
 */
class Logger {
  /**
   * Log an error with optional context
   * @param {string} message - Error message
   * @param {Object} context - Additional context data
   * @param {Error} error - Error object (optional)
   */
  static error(message, context = {}, error = null) {
    const logData = { ...context };
    if (error) {
      logData.stack = error.stack;
      logData.errorMessage = error.message;
    }
    logger.error(message, logData);
  }

  /**
   * Log a warning with optional context
   * @param {string} message - Warning message
   * @param {Object} context - Additional context data
   */
  static warn(message, context = {}) {
    logger.warn(message, context);
  }

  /**
   * Log an info message with optional context
   * @param {string} message - Info message
   * @param {Object} context - Additional context data
   */
  static info(message, context = {}) {
    logger.info(message, context);
  }

  /**
   * Log HTTP requests and responses
   * @param {string} message - HTTP log message
   * @param {Object} context - Request/response context
   */
  static http(message, context = {}) {
    logger.http(message, context);
  }

  /**
   * Log debug information (development only)
   * @param {string} message - Debug message
   * @param {Object} context - Debug context data
   */
  static debug(message, context = {}) {
    logger.debug(message, context);
  }

  /**
   * Log API request start
   * @param {Object} req - Express request object
   * @returns {Object} Request context for correlation
   */
  static requestStart(req) {
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const context = {
      requestId,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      query: req.query,
      ...(req.body && Object.keys(req.body).length > 0 && { bodyKeys: Object.keys(req.body) })
    };
    
    this.http('API request started', context);
    return { requestId, context };
  }

  /**
   * Log API request completion
   * @param {Object} requestContext - Context from requestStart
   * @param {number} statusCode - HTTP status code
   * @param {number} duration - Request duration in ms
   * @param {Object} additionalContext - Additional logging context
   */
  static requestEnd(requestContext, statusCode, duration, additionalContext = {}) {
    const context = {
      ...requestContext.context,
      statusCode,
      duration: `${duration}ms`,
      ...additionalContext
    };
    
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this[level]('API request completed', context);
  }

  /**
   * Log database operations
   * @param {string} operation - Database operation (get, save, delete, etc.)
   * @param {string} collection - Collection/table name
   * @param {Object} context - Operation context
   */
  static database(operation, collection, context = {}) {
    this.debug('Database operation', {
      operation,
      collection,
      ...context
    });
  }

  /**
   * Log cache operations
   * @param {string} operation - Cache operation (hit, miss, set, etc.)
   * @param {string} key - Cache key
   * @param {Object} context - Cache context
   */
  static cache(operation, key, context = {}) {
    this.debug('Cache operation', {
      operation,
      key,
      ...context
    });
  }

  /**
   * Log business logic events
   * @param {string} event - Business event name
   * @param {Object} context - Event context
   */
  static business(event, context = {}) {
    this.info('Business event', {
      event,
      ...context
    });
  }
}

module.exports = Logger;
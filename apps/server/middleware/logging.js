/**
 * HTTP Request/Response Logging Middleware
 * 
 * Provides structured logging for all HTTP requests and responses,
 * including timing, status codes, and contextual information.
 */

const Logger = require('../utils/logger');

/**
 * Request logging middleware
 * Logs request start and completion with timing and status information
 */
function requestLoggingMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Log request start and get context
  const requestContext = Logger.requestStart(req);
  
  // Attach request context to request object for use in routes
  req.logContext = requestContext;
  
  // Override res.json to capture response data
  const originalJson = res.json;
  const originalSend = res.send;
  let responseLogged = false;
  
  const logResponse = () => {
    if (responseLogged) return;
    responseLogged = true;
    
    const duration = Date.now() - startTime;
    const additionalContext = {};
    
    // Add timing categories
    if (duration > 1000) {
      additionalContext.performance = 'slow';
    } else if (duration > 500) {
      additionalContext.performance = 'moderate';
    } else {
      additionalContext.performance = 'fast';
    }
    
    // Add error context for 4xx/5xx responses
    if (res.statusCode >= 400) {
      additionalContext.errorCategory = res.statusCode >= 500 ? 'server_error' : 'client_error';
    }
    
    Logger.requestEnd(requestContext, res.statusCode, duration, additionalContext);
  };
  
  // Override JSON response to log
  res.json = function(data) {
    logResponse();
    return originalJson.call(this, data);
  };
  
  // Override send response to log
  res.send = function(data) {
    logResponse();
    return originalSend.call(this, data);
  };
  
  // Log on response finish (fallback)
  res.on('finish', logResponse);
  
  // Log on response close (connection closed)
  res.on('close', () => {
    if (!responseLogged) {
      const duration = Date.now() - startTime;
      Logger.warn('Request connection closed before response', {
        ...requestContext.context,
        duration: `${duration}ms`,
        statusCode: res.statusCode || 'unknown'
      });
    }
  });
  
  next();
}

/**
 * Error logging middleware (should be used after other error handlers)
 * Logs detailed error information for debugging
 */
function errorLoggingMiddleware(err, req, res, next) {
  // Extract request context if available
  const context = req.logContext ? req.logContext.context : {
    method: req.method,
    path: req.path,
    ip: req.ip
  };
  
  // Log the error with full context
  Logger.error('Unhandled request error', {
    ...context,
    errorName: err.name,
    errorCode: err.code,
    statusCode: res.statusCode || 500
  }, err);
  
  // If response hasn't been sent, send generic error
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: 'internal_error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  }
  
  next(err);
}

/**
 * Health check request filter
 * Reduces log noise by filtering out health check requests
 */
function healthCheckFilter(req, res, next) {
  // Skip detailed logging for health checks
  if (req.path === '/api/health' && req.method === 'GET') {
    // Light logging for health checks
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      Logger.debug('Health check', {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip
      });
    });
    
    return next();
  }
  
  // Use full logging for non-health requests
  return requestLoggingMiddleware(req, res, next);
}

/**
 * Security event logging
 * Logs security-relevant events like authentication failures
 */
class SecurityLogger {
  /**
   * Log authentication attempt
   * @param {Object} req - Express request object
   * @param {boolean} success - Whether authentication succeeded
   * @param {string} reason - Failure reason (if applicable)
   */
  static authAttempt(req, success, reason = null) {
    const context = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      success
    };
    
    if (!success && reason) {
      context.failureReason = reason;
    }
    
    Logger.info('Authentication attempt', context);
  }
  
  /**
   * Log rate limiting event
   * @param {Object} req - Express request object
   * @param {string} limitType - Type of rate limit hit
   */
  static rateLimited(req, limitType) {
    Logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      limitType
    });
  }
  
  /**
   * Log suspicious activity
   * @param {Object} req - Express request object
   * @param {string} activity - Description of suspicious activity
   */
  static suspicious(req, activity) {
    Logger.warn('Suspicious activity detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      activity
    });
  }
}

module.exports = {
  requestLoggingMiddleware,
  errorLoggingMiddleware,
  healthCheckFilter,
  SecurityLogger
};
/**
 * Standardized Error Response Middleware
 * 
 * Provides consistent error response format across all API endpoints:
 * {
 *   "success": false,
 *   "error": "error_type",
 *   "message": "Human readable message",
 *   "details": {},
 *   "timestamp": "2025-09-04T12:00:00Z"
 * }
 */

// Standard error codes and their HTTP status mappings
const ERROR_CODES = {
  // 400 - Bad Request
  INVALID_REQUEST: { status: 400, type: 'invalid_request' },
  MISSING_PARAMETER: { status: 400, type: 'missing_parameter' },
  INVALID_PARAMETER: { status: 400, type: 'invalid_parameter' },
  VALIDATION_ERROR: { status: 400, type: 'validation_error' },
  UNSUPPORTED_TYPE: { status: 400, type: 'unsupported_type' },
  
  // 401 - Unauthorized
  UNAUTHORIZED: { status: 401, type: 'unauthorized' },
  INVALID_TOKEN: { status: 401, type: 'invalid_token' },
  
  // 403 - Forbidden
  FORBIDDEN: { status: 403, type: 'forbidden' },
  INSUFFICIENT_PERMISSIONS: { status: 403, type: 'insufficient_permissions' },
  
  // 404 - Not Found
  NOT_FOUND: { status: 404, type: 'not_found' },
  RESOURCE_NOT_FOUND: { status: 404, type: 'resource_not_found' },
  ENDPOINT_NOT_FOUND: { status: 404, type: 'endpoint_not_found' },
  
  // 409 - Conflict
  CONFLICT: { status: 409, type: 'conflict' },
  RESOURCE_EXISTS: { status: 409, type: 'resource_exists' },
  
  // 422 - Unprocessable Entity
  PROCESSING_ERROR: { status: 422, type: 'processing_error' },
  TRANSFORMATION_FAILED: { status: 422, type: 'transformation_failed' },
  
  // 429 - Too Many Requests
  RATE_LIMITED: { status: 429, type: 'rate_limited' },
  
  // 500 - Internal Server Error
  INTERNAL_ERROR: { status: 500, type: 'internal_error' },
  DATABASE_ERROR: { status: 500, type: 'database_error' },
  SERVICE_UNAVAILABLE: { status: 503, type: 'service_unavailable' },
  
  // Custom application errors
  BRAND_PACK_CREATION_FAILED: { status: 500, type: 'brand_pack_creation_failed' },
  AI_SERVICE_ERROR: { status: 503, type: 'ai_service_error' },
  FILE_UPLOAD_ERROR: { status: 400, type: 'file_upload_error' },
  CACHE_ERROR: { status: 500, type: 'cache_error' },
  REDIS_ERROR: { status: 500, type: 'redis_error' },
  MONGODB_ERROR: { status: 500, type: 'mongodb_error' }
};

/**
 * Create standardized error response helper
 */
class ErrorResponse {
  /**
   * Create a standardized error response
   * @param {string} errorCode - Error code from ERROR_CODES
   * @param {string} message - Human readable error message
   * @param {Object} details - Additional error details (optional)
   * @returns {Object} Standardized error response object
   */
  static create(errorCode, message, details = {}) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL_ERROR;
    
    return {
      success: false,
      error: errorInfo.type,
      message: message || 'An error occurred',
      details: details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send standardized error response
   * @param {Object} res - Express response object
   * @param {string} errorCode - Error code from ERROR_CODES
   * @param {string} message - Human readable error message
   * @param {Object} details - Additional error details (optional)
   */
  static send(res, errorCode, message, details = {}) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL_ERROR;
    const response = ErrorResponse.create(errorCode, message, details);
    
    return res.status(errorInfo.status).json(response);
  }

  /**
   * Handle Express errors with standardized format
   * @param {Error} err - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handle(err, req, res, _next) {
    // Handle known error types
    if (err.code === 'EADDRINUSE') {
      return ErrorResponse.send(res, 'SERVICE_UNAVAILABLE', 'Port already in use', {
        port: err.port,
        address: err.address
      });
    }
    
    if (err.name === 'ValidationError') {
      return ErrorResponse.send(res, 'VALIDATION_ERROR', err.message, {
        validationErrors: err.errors
      });
    }
    
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
      return ErrorResponse.send(res, 'DATABASE_ERROR', 'Database operation failed', {
        code: err.code,
        originalError: err.message
      });
    }
    
    if (err.name === 'RedisError') {
      return ErrorResponse.send(res, 'REDIS_ERROR', 'Redis operation failed', {
        originalError: err.message
      });
    }
    
    // Handle generic errors - import Logger only when needed to avoid circular deps
    const Logger = require('../utils/logger');
    Logger.error('Unhandled error in middleware', {
      path: req.path,
      method: req.method,
      ip: req.ip
    }, err);
    
    return ErrorResponse.send(res, 'INTERNAL_ERROR', 'Internal server error', {
      originalError: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  /**
   * 404 Not Found middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static notFound(req, res, _next) {
    return ErrorResponse.send(res, 'ENDPOINT_NOT_FOUND', `Endpoint ${req.method} ${req.path} not found`, {
      method: req.method,
      path: req.path,
      availableEndpoints: [
        'GET /api/health',
        'GET /api/context',
        'GET /api/brand-packs',
        'POST /api/brand-packs',
        'POST /api/design/enhance',
        'POST /api/design/enhance-cached',
        'POST /api/design/suggest-proactive'
      ]
    });
  }
}

/**
 * Response helper for success responses (for consistency)
 */
class SuccessResponse {
  /**
   * Send standardized success response
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {string} message - Success message (optional)
   * @param {number} status - HTTP status code (default: 200)
   */
  static send(res, data, message = 'Success', status = 200) {
    return res.status(status).json({
      success: true,
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send paginated success response
   * @param {Object} res - Express response object
   * @param {Array} data - Response data array
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message (optional)
   */
  static sendPaginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message: message,
      data: data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || data.length,
        pages: pagination.pages || Math.ceil(pagination.total / pagination.limit)
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  ErrorResponse,
  SuccessResponse,
  ERROR_CODES
};
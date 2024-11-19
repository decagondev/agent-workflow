import { validationResult, body, param, query } from 'express-validator';
import { logger } from '../utils/logger';

class ValidationMiddleware {
  /**
   * Validate request and handle validation errors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation failed', { 
        errors: errors.array(),
        path: req.path,
        method: req.method 
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  }

  /**
   * Task creation validation rules
   */
  taskCreationValidation() {
    return [
      body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
      
      body('priority')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
        .withMessage('Invalid priority level'),
      
      body('estimatedHours')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Estimated hours must be between 0 and 100')
    ];
  }

  /**
   * Agent interaction validation rules
   */
  agentInteractionValidation() {
    return [
      body('taskId')
        .exists()
        .isMongoId()
        .withMessage('Valid task ID is required'),
      
      body('agentType')
        .isIn(['PLANNER', 'GENERATOR', 'REVIEWER'])
        .withMessage('Invalid agent type'),
      
      body('payload')
        .exists()
        .withMessage('Agent interaction payload is required')
    ];
  }

  /**
   * Parameter ID validation
   */
  paramIdValidation() {
    return [
      param('id')
        .exists()
        .isMongoId()
        .withMessage('Invalid resource ID')
    ];
  }

  /**
   * Query parameter validation for listing resources
   */
  listQueryValidation() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('sortBy')
        .optional()
        .isString()
        .withMessage('Sort by must be a string'),
      
      query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Order must be either "asc" or "desc"')
    ];
  }

  /**
   * Complex validation for code generation request
   */
  codeGenerationValidation() {
    return [
      body('language')
        .exists()
        .isIn(['javascript', 'typescript', 'python', 'java', 'rust'])
        .withMessage('Unsupported programming language'),
      
      body('complexity')
        .optional()
        .isIn(['BASIC', 'INTERMEDIATE', 'ADVANCED'])
        .withMessage('Invalid complexity level'),
      
      body('requirements')
        .optional()
        .isArray()
        .withMessage('Requirements must be an array')
    ];
  }

  /**
   * Sanitize and validate user input
   * @param {string} input - Input to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized input
   */
  sanitizeInput(input, options = {}) {
    if (!input) return input;

    let sanitized = input.trim();

    sanitized = sanitized.replace(/<[^>]*>/g, '');

    if (options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }


    return sanitized;
  }
}

export default new ValidationMiddleware();

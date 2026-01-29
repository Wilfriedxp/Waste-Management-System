const { body, validationResult } = require('express-validator');

// Validation middleware for notification creation
const validateNotification = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('Valid user_id is required'),

  body('address')
    .isLength({ min: 5, max: 255 })
    .withMessage('Address must be between 5 and 255 characters'),

  body('waste_type')
    .isIn(['organic', 'plastic', 'paper', 'metal', 'glass', 'electronic', 'other'])
    .withMessage('Invalid waste type'),

  body('estimated_volume')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Estimated volume must be between 0.1 and 100'),

  body('urgency')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid urgency level'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for collection request creation
const validateCollectionRequest = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('Valid user_id is required'),

  body('pickup_address')
    .isLength({ min: 5, max: 255 })
    .withMessage('Pickup address must be between 5 and 255 characters'),

  body('waste_types')
    .isArray({ min: 1 })
    .withMessage('At least one waste type is required'),

  body('waste_types.*')
    .isIn(['organic', 'plastic', 'paper', 'metal', 'glass', 'electronic', 'other'])
    .withMessage('Invalid waste type in array'),

  body('estimated_volume')
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Estimated volume must be between 0.1 and 100'),

  body('preferred_date')
    .optional()
    .isISO8601()
    .withMessage('Preferred date must be a valid ISO date'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateNotification,
  validateCollectionRequest
};

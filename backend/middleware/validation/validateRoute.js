const { body, param, query, validationResult } = require('express-validator');

// Reusable error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }
  next();
};

// CREATE validation
const validateCreateRoute = [
  body('name')
    .notEmpty().withMessage('Route name is required')
    .isLength({ max: 100 }).withMessage('Route name cannot exceed 100 characters'),
  body('coordinates')
    .isArray({ min: 2 }).withMessage('At least 2 coordinates are required'),
  body('coordinates.*')
    .isArray({ min: 2, max: 2 }).withMessage('Each coordinate must be a valid [longitude, latitude] pair'),
  body('isPublic')
    .notEmpty().withMessage('Visibility status is required')
    .isIn([true, false, 'true', 'false']).withMessage('Visibility status must be public or private'),
  handleValidationErrors
];

// UPDATE validation
const validateUpdateRoute = [
  param('id')
    .isMongoId().withMessage('Invalid route ID format'),
  body('name')
    .optional()
    .isLength({ max: 100 }).withMessage('Route name cannot exceed 100 characters'),
  body('coordinates')
    .optional()
    .isArray({ min: 2 }).withMessage('At least 2 coordinates are required'),
  body('coordinates.*')
    .optional()
    .isArray({ min: 2, max: 2 }).withMessage('Each coordinate must be a valid [longitude, latitude] pair'),
  body('isPublic')
    .optional()
    .isIn([true, false, 'true', 'false']).withMessage('Visibility status must be public or private'),
  body()
    .custom((_, { req }) => {
      const { name, coordinates, isPublic } = req.body;
      if (!name && !coordinates && isPublic === undefined) {
        throw new Error('At least one field must be provided for update');
      }
      return true;
    }),
  handleValidationErrors
];

// DELETE & READ by ID validation
const validateRouteId = [
  param('id')
    .isMongoId().withMessage('Invalid route ID format'),
  handleValidationErrors
];

// NEARBY routes validation
const validateNearbyRoutes = [
  query('lat')
    .notEmpty().withMessage('Latitude (lat) is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a number between -90 and 90'),
  query('lng')
    .notEmpty().withMessage('Longitude (lng) is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a number between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ min: 1 }).withMessage('Radius must be a positive number'),
  handleValidationErrors
];

module.exports = { 
  validateCreateRoute, 
  validateUpdateRoute, 
  validateRouteId,
  validateNearbyRoutes 
};
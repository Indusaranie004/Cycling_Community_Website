const { body, param, validationResult } = require('express-validator');

// Reusable error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }
  next();
};

// CREATE validation
const validateCreateRide = [
  body('route_id')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid route ID format'),
  body('distance_km')
    .notEmpty().withMessage('Distance is required')
    .isFloat({ gt: 0 }).withMessage('Distance must be a number greater than 0'),
  body('duration_minutes')
    .notEmpty().withMessage('Duration is required')
    .isFloat({ gt: 0 }).withMessage('Duration must be a number greater than 0'),
  body('start_time')
    .optional()
    .isISO8601().withMessage('Start time must be a valid date/time format'),
  body('end_time')
    .optional()
    .isISO8601().withMessage('End time must be a valid date/time format'),
  handleValidationErrors
];

// UPDATE validation
const validateUpdateRide = [
  param('id')
    .isMongoId().withMessage('Invalid ride ID format'),
  body('distance_km')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Distance must be a number greater than 0'),
  body('duration_minutes')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Duration must be a number greater than 0'),
  body('start_time')
    .optional()
    .isISO8601().withMessage('Start time must be a valid date/time format'),
  body('end_time')
    .optional()
    .isISO8601().withMessage('End time must be a valid date/time format'),
  body()
    .custom((_, { req }) => {
      const { distance_km, duration_minutes, start_time, end_time } = req.body;
      if (!distance_km && !duration_minutes && !start_time && !end_time) {
        throw new Error('At least one field must be provided to update a ride');
      }
      return true;
    }),
  handleValidationErrors
];

// DELETE & READ by ID validation
const validateRideId = [
  param('id')
    .isMongoId().withMessage('Invalid ride ID format'),
  handleValidationErrors
];

module.exports = { 
  validateCreateRide, 
  validateUpdateRide, 
  validateRideId 
};
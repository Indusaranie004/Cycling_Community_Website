const { param, validationResult } = require('express-validator');

// Reusable error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }
  next();
};

// Validate route ID parameter
const validateRouteId = [
  param('routeId')
    .isMongoId().withMessage('Invalid route ID format'),
  handleValidationErrors
];

module.exports = { validateRouteId };
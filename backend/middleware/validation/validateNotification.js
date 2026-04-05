const { param, query, body, validationResult } = require('express-validator');

// Reusable error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
};

// GET all — query filter validation
const validateNotificationQuery = [
    query('userId')
        .optional()
        .isMongoId().withMessage('userId must be a valid MongoDB ID'),
    handleValidationErrors
];

// GET/DELETE by ID validation
const validateNotificationId = [
    param('id')
        .isMongoId().withMessage('Invalid notification ID format'),
    handleValidationErrors
];

// PUT update validation
const validateUpdateNotification = [
    param('id')
        .isMongoId().withMessage('Invalid notification ID format'),
    body('status')
        .optional()
        .isIn(['sent', 'failed']).withMessage('status must be either sent or failed'),
    body('title')
        .optional()
        .notEmpty().withMessage('title cannot be empty'),
    body('body')
        .optional()
        .notEmpty().withMessage('body cannot be empty'),
    body()
        .custom((_, { req }) => {
            const fields = ['status', 'title', 'body', 'fcmToken'];
            const hasField = fields.some(f => req.body[f] !== undefined);
            if (!hasField) {
                throw new Error('At least one field must be provided for update');
            }
            return true;
        }),
    handleValidationErrors
];

module.exports = {
    validateNotificationQuery,
    validateNotificationId,
    validateUpdateNotification
};
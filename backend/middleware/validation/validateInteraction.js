const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
};

// CREATE validation
const validateCreateInteraction = [
    body('intType')
        .notEmpty().withMessage('intType is required')
        .isIn(['hazard', 'feedback']).withMessage('intType must be either hazard or feedback'),
    body('intRating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('intRating must be between 1 and 5'),
    body('severityLevel')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('severityLevel must be low, medium, or high'),
    body('intLatitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('intLatitude must be between -90 and 90'),
    body('intLongitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('intLongitude must be between -180 and 180'),
    body('expiryTime')
        .optional()
        .isISO8601().withMessage('expiryTime must be a valid date'),
    handleValidationErrors
];

// UPDATE validation
const validateUpdateInteraction = [
    param('id')
        .isMongoId().withMessage('Invalid interaction ID format'),
    body('intType')
        .optional()
        .isIn(['hazard', 'feedback']).withMessage('intType must be either hazard or feedback'),
    body('intRating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('intRating must be between 1 and 5'),
    body('severityLevel')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('severityLevel must be low, medium, or high'),
    body('intLatitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('intLatitude must be between -90 and 90'),
    body('intLongitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('intLongitude must be between -180 and 180'),
    body('expiryTime')
        .optional()
        .isISO8601().withMessage('expiryTime must be a valid date'),
    body()
        .custom((_, { req }) => {
            const fields = ['intType', 'intRating', 'severityLevel', 'intLatitude', 
                          'intLongitude', 'intDescription', 'intImgUrl', 'expiryTime'];
            const hasField = fields.some(f => req.body[f] !== undefined);
            if (!hasField) {
                throw new Error('At least one field must be provided for update');
            }
            return true;
        }),
    handleValidationErrors
];

// GET/DELETE by ID validation
const validateInteractionId = [
    param('id')
        .isMongoId().withMessage('Invalid interaction ID format'),
    handleValidationErrors
];

// GET all — query filter validation
const validateInteractionQuery = [
    query('intType')
        .optional()
        .isIn(['hazard', 'feedback']).withMessage('intType must be hazard or feedback'),
    query('isActive')
        .optional()
        .isIn(['true', 'false']).withMessage('isActive must be true or false'),
    handleValidationErrors
];

module.exports = {
    validateCreateInteraction,
    validateUpdateInteraction,
    validateInteractionId,
    validateInteractionQuery
};
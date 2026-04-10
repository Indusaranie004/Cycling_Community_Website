const { body, param, query, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
  }
  next();
};

// CREATE validation
// backend/middleware/validation/interactionValidation.js (or wherever it is)

const validateCreateInteraction = [
  body("intType")
    .notEmpty()
    .withMessage("intType is required")
    .isIn(["hazard", "feedback"])
    .withMessage("intType must be either hazard or feedback"),
    
  // Add { checkFalsy: true } to all optional numeric/date fields
  body("intRating")
    .optional({ checkFalsy: true }) 
    .isInt({ min: 1, max: 5 })
    .withMessage("intRating must be between 1 and 5"),

  body("severityLevel")
    .optional({ checkFalsy: true })
    .isIn(["low", "medium", "high"])
    .withMessage("severityLevel must be low, medium, or high"),

  body("intLatitude")
    .optional({ checkFalsy: true }) // 👈 This ignores empty strings
    .isFloat({ min: -90, max: 90 })
    .withMessage("intLatitude must be between -90 and 90"),

  body("intLongitude")
    .optional({ checkFalsy: true }) // 👈 This ignores empty strings
    .isFloat({ min: -180, max: 180 })
    .withMessage("intLongitude must be between -180 and 180"),

  body("expiryTime")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("expiryTime must be a valid date"),

  handleValidationErrors,
];

// UPDATE validation
const validateUpdateInteraction = [
  param("id").isMongoId().withMessage("Invalid interaction ID format"),
  body("intType")
    .optional()
    .isIn(["hazard", "feedback"])
    .withMessage("intType must be either hazard or feedback"),
  body("intRating").optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }),
  body('severityLevel')
  .optional({ checkFalsy: true })
  .isIn(['low', 'medium', 'high']),
  body("intLatitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 }),
  body("intLongitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 }),
  body("expiryTime")
    .optional()
    .isISO8601()
    .withMessage("expiryTime must be a valid date"),
  body().custom((_, { req }) => {
    const fields = [
  'intType', 'intRating', 'severityLevel',
  'intLatitude', 'intLongitude',
  'intDescription', 'intImgUrl',
  'expiryTime', 'routeId' // ✅ ADD THIS
];
    const hasField = fields.some(
      (f) => req.body[f] !== undefined && req.body[f] !== "",
    );
    if (!hasField) {
      throw new Error("At least one field must be provided for update");
    }
    return true;
  }),
  handleValidationErrors,
];

// GET/DELETE by ID validation
const validateInteractionId = [
  param("id").isMongoId().withMessage("Invalid interaction ID format"),
  handleValidationErrors,
];

// GET all — query filter validation
const validateInteractionQuery = [
  query("intType")
    .optional()
    .isIn(["hazard", "feedback"])
    .withMessage("intType must be hazard or feedback"),
  query("isActive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isActive must be true or false"),
  handleValidationErrors,
];

module.exports = {
  validateCreateInteraction,
  validateUpdateInteraction,
  validateInteractionId,
  validateInteractionQuery,
};

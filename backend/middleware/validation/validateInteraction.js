const { body, param, query, validationResult } = require("express-validator");

// backend/middleware/validation/validateInteraction.js (or similar)

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  // 1. ADD THIS LOG HERE:
  if (!errors.isEmpty()) {
    console.log("❌ VALIDATION FAILED!");
    console.log("Body received by server:", req.body); // Check if intType is here
    console.log("Errors:", errors.array());
    
    return res.status(400).json({ 
      errors: errors.array().map((e) => e.msg) 
    });
  }
  next();
};

// CREATE validation
// backend/middleware/validation/interactionValidation.js (or wherever it is)

// backend/middleware/validation/interactionValidation.js

const validateCreateInteraction = [
  body("intType")
    .notEmpty()
    .withMessage("intType is required")
    .isIn(["hazard", "feedback"])
    .withMessage("intType must be either hazard or feedback"),

  body("intRating")
    .optional({ checkFalsy: true }) 
    .isInt({ min: 1, max: 5 })
    .withMessage("intRating must be between 1 and 5"),

  body("severityLevel")
    .optional({ checkFalsy: true })
    .isIn(["low", "medium", "high"])
    .withMessage("severityLevel must be low, medium, or high"),

  body("intLatitude")
    .optional({ checkFalsy: true }) // This treats "" as null/ignored
    .isFloat({ min: -90, max: 90 })
    .withMessage("intLatitude must be a valid number between -90 and 90"),

  body("intLongitude")
    .optional({ checkFalsy: true }) // This treats "" as null/ignored
    .isFloat({ min: -180, max: 180 })
    .withMessage("intLongitude must be a valid number between -180 and 180"),

  body("expiryTime")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("expiryTime must be a valid ISO8601 date"),

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

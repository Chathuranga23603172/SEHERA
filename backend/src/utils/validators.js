const { body, param, query } = require("express-validator");
const {
  CLOTHING_CATEGORIES,
  CLOTHING_SIZES,
  COLORS,
  SEASONS,
  OCCASIONS,
  BUDGET_PERIODS,
  PAYMENT_METHODS,
} = require("./constants");
// User validation rules
const validateUserRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        throw new Error("Must be at least 13 years old");
      }
      return true;
    }),
];
const validateUserLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
const validatePasswordReset = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];
const validatePasswordUpdate = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
];
// Clothing item validation rules
const validateClothingItem = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Item name must be between 2 and 100 characters"),
  body("type").trim().notEmpty().withMessage("Item type is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(
      Object.values(CLOTHING_CATEGORIES.MENSWEAR).concat(
        Object.values(CLOTHING_CATEGORIES.WOMENSWEAR),
        Object.values(CLOTHING_CATEGORIES.KIDSWEAR)
      )
    )
    .withMessage("Invalid category"),
  body("brand")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Brand name must not exceed 50 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("color").optional().trim().isIn(COLORS).withMessage("Invalid color"),

  body("size")
    .optional()
    .trim()
    .custom((value) => {
      const allSizes = Object.values(CLOTHING_SIZES).flat();
      if (value && !allSizes.includes(value)) {
        throw new Error("Invalid size");
      }
      return true;
    }),

  body("season")
    .optional()
    .isIn(Object.values(SEASONS))
    .withMessage("Invalid season"),

  body("occasion")
    .optional()
    .isArray()
    .withMessage("Occasions must be an array"),

  body("occasion.*")
    .optional()
    .isIn(Object.values(OCCASIONS))
    .withMessage("Invalid occasion"),
  body("purchaseDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid purchase date"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),
];
// Style combo validation rules
const validateStyleCombo = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Outfit name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Outfit name must be between 2 and 100 characters"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required for an outfit"),
  body("items.*.itemId").isMongoId().withMessage("Invalid item ID"),
  body("items.*.itemType")
    .isIn(["menswear", "womenswear", "kidswear"])
    .withMessage("Invalid item type"),
  body("eventType")
    .optional()
    .isIn(Object.values(OCCASIONS))
    .withMessage("Invalid event type"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean"),
];
// Budget validation rules
const validateBudget = [
  body("period")
    .isIn(Object.values(BUDGET_PERIODS))
    .withMessage("Invalid budget period"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Budget amount must be a positive number"),
  body("categories")
    .optional()
    .isArray()
    .withMessage("Categories must be an array"),
  body("categories.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name is required"),
  body("categories.*.amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Category amount must be a positive number"),
  body("alertThreshold")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Alert threshold must be between 0 and 100"),
  body("startDate").optional().isISO8601().withMessage("Invalid start date"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date")
    .custom((value, { req }) => {
      if (
        req.body.startDate &&
        new Date(value) <= new Date(req.body.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
];
// Payment validation rules
const validatePayment = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Payment amount must be greater than 0"),
  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),
  body("paymentMethod")
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage("Invalid payment method"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description must not exceed 200 characters"),
  body("items").optional().isArray().withMessage("Items must be an array"),
  body("items.*.itemId").optional().isMongoId().withMessage("Invalid item ID"),
  body("items.*.quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("items.*.price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Item price must be a positive number"),
];
// Query validation rules
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
const validateDateRange = [
  query("startDate").optional().isISO8601().withMessage("Invalid start date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date")
    .custom((value, { req }) => {
      if (
        req.query.startDate &&
        new Date(value) <= new Date(req.query.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
];
const validateSortOptions = [
  query("sortBy")
    .optional()
    .isIn([
      "name",
      "price",
      "createdAt",
      "updatedAt",
      "usageCount",
      "purchaseDate",
    ])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];
const validateFilterOptions = [
  query("category").optional().trim(),

  query("brand").optional().trim(),

  query("color").optional().isIn(COLORS).withMessage("Invalid color"),

  query("size").optional().trim(),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number")
    .custom((value, { req }) => {
      if (
        req.query.minPrice &&
        parseFloat(value) <= parseFloat(req.query.minPrice)
      ) {
        throw new Error("Maximum price must be greater than minimum price");
      }
      return true;
    }),
];
// Parameter validation rules
const validateMongoId = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];
const validateUserId = [
  param("userId").isMongoId().withMessage("Invalid user ID format"),
];
// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }
  const file = req.file || (req.files && req.files[0]);
  // Check file size
  if (file.size > 5 * 1024 * 1024) {
    // 5MB
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size is 5MB",
    });
  }
  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only images are allowed",
    });
  }
  next();
};
// Custom validators
const validateCustom = {
  // Check if user owns the resource
  isOwner: (Model) => {
    return async (req, res, next) => {
      try {
        const resource = await Model.findById(req.params.id);
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: "Resource not found",
          });
        }

        if (resource.userId.toString() !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: "Access forbidden",
          });
        }

        req.resource = resource;
        next();
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Server error",
        });
      }
    };
  },
  // Check if email is unique
  isUniqueEmail: async (value, { req }) => {
    const User = require("../models/User");
    const existingUser = await User.findOne({
      email: value,
      _id: { $ne: req.params.id }, // Exclude current user when updating
    });
    if (existingUser) {
      throw new Error("Email already in use");
    }
    return true;
  },
  // Validate age for kids wear
  validateKidsAge: (value) => {
    const age = parseInt(value);
    if (age < 0 || age > 18) {
      throw new Error("Age must be between 0 and 18 for kids wear");
    }
    return true;
  },
};
module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validatePasswordUpdate,
  validateClothingItem,
  validateStyleCombo,
  validateBudget,
  validatePayment,
  validatePagination,
  validateDateRange,
  validateSortOptions,
  validateFilterOptions,
  validateMongoId,
  validateUserId,
  validateFileUpload,
  validateCustom,
};

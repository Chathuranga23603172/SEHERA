// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
// User Roles
const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
};
// Clothing Categories
const CLOTHING_CATEGORIES = {
  MENSWEAR: {
    FORMAL: "formal",
    CASUAL: "casual",
    SPORTSWEAR: "sportswear",
    ACCESSORIES: "accessories",
    FOOTWEAR: "footwear",
    UNDERWEAR: "underwear",
    OUTERWEAR: "outerwear",
  },
  WOMENSWEAR: {
    FORMAL: "formal",
    CASUAL: "casual",
    SPORTSWEAR: "sportswear",
    PARTY: "party",
    OFFICE: "office",
    ACCESSORIES: "accessories",
    FOOTWEAR: "footwear",
    UNDERWEAR: "underwear",
    OUTERWEAR: "outerwear",
  },
  KIDSWEAR: {
    SCHOOL: "school",
    PLAY: "play",
    FORMAL: "formal",
    SLEEPWEAR: "sleepwear",
    FOOTWEAR: "footwear",
    ACCESSORIES: "accessories",
  },
};
// Clothing Types
const CLOTHING_TYPES = {
  MENSWEAR: [
    "shirt",
    "pants",
    "jacket",
    "suit",
    "tie",
    "shoes",
    "belt",
    "watch",
    "jeans",
    "t-shirt",
    "polo",
    "sweater",
    "coat",
    "shorts",
    "underwear",
    "socks",
    "sneakers",
    "dress-shoes",
    "boots",
    "hat",
    "sunglasses",
  ],
  WOMENSWEAR: [
    "dress",
    "blouse",
    "skirt",
    "pants",
    "jacket",
    "shoes",
    "handbag",
    "jewelry",
    "jeans",
    "t-shirt",
    "sweater",
    "coat",
    "shorts",
    "underwear",
    "bra",
    "heels",
    "flats",
    "boots",
    "scarf",
    "hat",
    "sunglasses",
  ],
  KIDSWEAR: [
    "shirt",
    "pants",
    "dress",
    "shorts",
    "shoes",
    "jacket",
    "sweater",
    "underwear",
    "socks",
    "pajamas",
    "uniform",
    "sneakers",
    "sandals",
    "hat",
    "backpack",
  ],
};
// Clothing Sizes
const CLOTHING_SIZES = {
  GENERAL: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  NUMERIC: ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46"],
  KIDS_AGE: [
    "0-3m",
    "3-6m",
    "6-9m",
    "9-12m",
    "12-18m",
    "18-24m",
    "2T",
    "3T",
    "4T",
    "5T",
    "6",
    "7",
    "8",
    "10",
    "12",
    "14",
    "16",
  ],
  SHOES_US: [
    "5",
    "5.5",
    "6",
    "6.5",
    "7",
    "7.5",
    "8",
    "8.5",
    "9",
    "9.5",
    "10",
    "10.5",
    "11",
    "11.5",
    "12",
    "13",
    "14",
  ],
};
// Colors
const COLORS = [
  "black",
  "white",
  "gray",
  "grey",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "beige",
  "navy",
  "maroon",
  "olive",
  "lime",
  "aqua",
  "teal",
  "silver",
  "gold",
  "cream",
  "burgundy",
  "khaki",
  "coral",
  "mint",
  "lavender",
  "tan",
];
// Brands (Popular fashion brands)
const BRANDS = [
  "Nike",
  "Adidas",
  "Zara",
  "H&M",
  "Uniqlo",
  "Forever21",
  "GAP",
  "Levi's",
  "Calvin Klein",
  "Tommy Hilfiger",
  "Ralph Lauren",
  "Gucci",
  "Prada",
  "Louis Vuitton",
  "Chanel",
  "Versace",
  "Armani",
  "Dolce & Gabbana",
  "Burberry",
  "Coach",
  "Michael Kors",
  "Kate Spade",
  "Tory Burch",
  "Banana Republic",
  "J.Crew",
  "Old Navy",
  "Target",
  "Walmart",
];
// Seasons
const SEASONS = {
  SPRING: "spring",
  SUMMER: "summer",
  FALL: "fall",
  AUTUMN: "autumn",
  WINTER: "winter",
  ALL_SEASON: "all-season",
};
// Occasions/Events
const OCCASIONS = {
  CASUAL: "casual",
  WORK: "work",
  FORMAL: "formal",
  PARTY: "party",
  WEDDING: "wedding",
  DATE: "date",
  INTERVIEW: "interview",
  VACATION: "vacation",
  SPORTS: "sports",
  TRAVEL: "travel",
  SHOPPING: "shopping",
  DINNER: "dinner",
  BUSINESS: "business",
  COCKTAIL: "cocktail",
  GRADUATION: "graduation",
};
// Budget Periods
const BUDGET_PERIODS = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  YEARLY: "yearly",
};
// Payment Methods
const PAYMENT_METHODS = {
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  WALLET: "wallet",
  CASH: "cash",
  CRYPTO: "crypto",
};
// Payment Status
const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELED: "canceled",
  REFUNDED: "refunded",
};
// File Upload Limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_UPLOAD: 5,
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  ALLOWED_IMAGE_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
};
// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
// Rate Limiting
const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  UPLOAD: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10,
  },
};
// Email Templates
const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  PASSWORD_RESET: "password_reset",
  BUDGET_ALERT: "budget_alert",
  ORDER_CONFIRMATION: "order_confirmation",
  MONTHLY_REPORT: "monthly_report",
  SIZE_ALERT: "size_alert",
};
// Notification Types
const NOTIFICATION_TYPES = {
  BUDGET_WARNING: "budget_warning",
  BUDGET_EXCEEDED: "budget_exceeded",
  SIZE_ALERT: "size_alert",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",
  NEW_OUTFIT: "new_outfit",
  MONTHLY_REPORT: "monthly_report",
};
// Error Messages
const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: "This field is required",
    INVALID_EMAIL: "Please enter a valid email address",
    INVALID_PASSWORD: "Password must be at least 8 characters long",
    PASSWORD_MISMATCH: "Passwords do not match",
    INVALID_PHONE: "Please enter a valid phone number",
    INVALID_URL: "Please enter a valid URL",
  },
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_NOT_FOUND: "Account not found",
    ACCOUNT_ALREADY_EXISTS: "An account with this email already exists",
    TOKEN_EXPIRED: "Token has expired",
    INVALID_TOKEN: "Invalid token",
    UNAUTHORIZED: "You are not authorized to perform this action",
    FORBIDDEN: "Access forbidden",
  },
  FILE: {
    FILE_TOO_LARGE: "File size too large",
    INVALID_FILE_TYPE: "Invalid file type",
    UPLOAD_FAILED: "File upload failed",
    FILE_NOT_FOUND: "File not found",
  },
  PAYMENT: {
    PAYMENT_FAILED: "Payment processing failed",
    INSUFFICIENT_FUNDS: "Insufficient funds",
    INVALID_CARD: "Invalid card details",
    PAYMENT_DECLINED: "Payment was declined",
  },
  GENERAL: {
    INTERNAL_ERROR: "Internal server error",
    NOT_FOUND: "Resource not found",
    BAD_REQUEST: "Bad request",
    NETWORK_ERROR: "Network error occurred",
  },
};
// Success Messages
const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Successfully logged in",
    LOGOUT_SUCCESS: "Successfully logged out",
    REGISTER_SUCCESS: "Account created successfully",
    PASSWORD_RESET: "Password reset successfully",
    EMAIL_SENT: "Email sent successfully",
  },
  CRUD: {
    CREATED: "Item created successfully",
    UPDATED: "Item updated successfully",
    DELETED: "Item deleted successfully",
    FETCHED: "Data retrieved successfully",
  },
  PAYMENT: {
    PAYMENT_SUCCESS: "Payment processed successfully",
    REFUND_SUCCESS: "Refund processed successfully",
  },
  FILE: {
    UPLOAD_SUCCESS: "File uploaded successfully",
    DELETE_SUCCESS: "File deleted successfully",
  },
};
// Budget Alert Thresholds
const BUDGET_THRESHOLDS = {
  WARNING: 75, // 75% of budget
  CRITICAL: 90, // 90% of budget
  EXCEEDED: 100, // 100% of budget
};
// Style Combo Settings
const STYLE_COMBO = {
  MAX_ITEMS_PER_OUTFIT: 10,
  MAX_OUTFITS_FOR_COMPARISON: 3,
  SHARING_PLATFORMS: [
    "facebook",
    "instagram",
    "pinterest",
    "twitter",
    "whatsapp",
  ],
};
// Kids Growth Stages
const GROWTH_STAGES = {
  BABY: {
    label: "Baby",
    ageRange: "0-24 months",
    sizes: ["0-3m", "3-6m", "6-9m", "9-12m", "12-18m", "18-24m"],
  },
  TODDLER: {
    label: "Toddler",
    ageRange: "2-4 years",
    sizes: ["2T", "3T", "4T"],
  },
  KIDS: {
    label: "Kids",
    ageRange: "5-12 years",
    sizes: ["5", "6", "7", "8", "10", "12"],
  },
  TEENS: {
    label: "Teens",
    ageRange: "13-18 years",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
};
// Report Types
const REPORT_TYPES = {
  SPENDING: "spending",
  BUDGET_ANALYSIS: "budget_analysis",
  OUTFIT_USAGE: "outfit_usage",
  SUSTAINABILITY: "sustainability",
  MONTHLY_SUMMARY: "monthly_summary",
};
// Report Formats
const REPORT_FORMATS = {
  JSON: "json",
  PDF: "pdf",
  EXCEL: "excel",
  CSV: "csv",
};
// Database Collection Names
const COLLECTIONS = {
  USERS: "users",
  MENSWEAR: "menswear",
  WOMENSWEAR: "womenswear",
  KIDSWEAR: "kidswear",
  STYLE_COMBOS: "stylecombos",
  BUDGETS: "budgets",
  PAYMENTS: "payments",
  NOTIFICATIONS: "notifications",
};
// API Endpoints
const API_ENDPOINTS = {
  AUTH: "/api/auth",
  MENSWEAR: "/api/menswear",
  WOMENSWEAR: "/api/womenswear",
  KIDSWEAR: "/api/kidswear",
  STYLE_COMBO: "/api/style-combo",
  BUDGET: "/api/budget",
  PAYMENT: "/api/payment",
  REPORTS: "/api/reports",
  UPLOAD: "/api/upload",
};
// Default Values
const DEFAULTS = {
  CURRENCY: "USD",
  LANGUAGE: "en",
  TIMEZONE: "UTC",
  ITEMS_PER_PAGE: 12,
  BUDGET_PERIOD: BUDGET_PERIODS.MONTHLY,
};
// Environment Types
const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
  TEST: "test",
};
// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};
module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  CLOTHING_CATEGORIES,
  CLOTHING_TYPES,
  CLOTHING_SIZES,
  COLORS,
  BRANDS,
  SEASONS,
  OCCASIONS,
  BUDGET_PERIODS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  UPLOAD_LIMITS,
  PAGINATION,
  RATE_LIMITS,
  EMAIL_TEMPLATES,
  NOTIFICATION_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  BUDGET_THRESHOLDS,
  STYLE_COMBO,
  GROWTH_STAGES,
  REPORT_TYPES,
  REPORT_FORMATS,
  COLLECTIONS,
  API_ENDPOINTS,
  DEFAULTS,
  ENVIRONMENTS,
  CACHE_TTL,
};

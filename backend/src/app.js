const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();
// Import middleware
const errorHandler = require("./middleware/errorHandler");
const { authenticateToken } = require("./middleware/auth");
// Import routes
const authRoutes = require("./routes/auth");
const menswearRoutes = require("./routes/menswear");
const womenswearRoutes = require("./routes/womenswear");
const kidswearRoutes = require("./routes/kidswear");
const styleComboRoutes = require("./routes/styleCombo");
const budgetRoutes = require("./routes/budget");
const paymentRoutes = require("./routes/payment");
// Import constants
const { RATE_LIMITS, API_ENDPOINTS } = require("./utils/constants");
// Create Express app
const app = express();
// Trust proxy (important for rate limiting behind reverse proxy)
app.set("trust proxy", 1);
// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://your-frontend-domain.com",
    ];
    if (process.env.NODE_ENV === "development") {
      allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));
// Rate limiting
const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.WINDOW_MS,
  max: RATE_LIMITS.GENERAL.MAX_REQUESTS,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const uploadLimiter = rateLimit({
  windowMs: RATE_LIMITS.UPLOAD.WINDOW_MS,
  max: RATE_LIMITS.UPLOAD.MAX_REQUESTS,
  message: {
    success: false,
    message: "Too many upload requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
// Apply rate limiting
app.use(generalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/upload", uploadLimiter);
// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});
// API status endpoint
app.get("/api/status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fashion App API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: API_ENDPOINTS.AUTH,
      menswear: API_ENDPOINTS.MENSWEAR,
      womenswear: API_ENDPOINTS.WOMENSWEAR,
      kidswear: API_ENDPOINTS.KIDSWEAR,
      styleCombo: API_ENDPOINTS.STYLE_COMBO,
      budget: API_ENDPOINTS.BUDGET,
      payment: API_ENDPOINTS.PAYMENT,
      reports: API_ENDPOINTS.REPORTS,
    },
  });
});
// API Routes
app.use(API_ENDPOINTS.AUTH, authRoutes);
app.use(API_ENDPOINTS.MENSWEAR, authenticateToken, menswearRoutes);
app.use(API_ENDPOINTS.WOMENSWEAR, authenticateToken, womenswearRoutes);
app.use(API_ENDPOINTS.KIDSWEAR, authenticateToken, kidswearRoutes);
app.use(API_ENDPOINTS.STYLE_COMBO, authenticateToken, styleComboRoutes);
app.use(API_ENDPOINTS.BUDGET, authenticateToken, budgetRoutes);
app.use(API_ENDPOINTS.PAYMENT, authenticateToken, paymentRoutes);
// Stripe webhook endpoint (before body parser middleware)
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        // Handle successful payment
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);
        // Handle failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// File upload endpoint
app.post("/api/upload", authenticateToken, uploadLimiter, (req, res) => {
  const { uploadSingle } = require("./services/imageUpload");

  uploadSingle("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: req.file.path,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  });
});

// Global error handling for unhandled routes
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});
// Global error handling middleware (must be last)
app.use(errorHandler);
// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Promise Rejection:", err.message);
  // Close server & exit process
  process.exit(1);
});
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:", err.message);
  process.exit(1);
});
module.exports = app;

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Stripe payment information
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripeChargeId: String,

    // Payment details
    amount: {
      value: {
        type: Number,
        required: [true, "Payment amount is required"],
        min: 0,
      },
      currency: {
        type: String,
        required: true,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "LKR", "CAD", "AUD", "JPY", "INR"],
      },
      // Amount breakdown
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      tax: {
        type: Number,
        default: 0,
        min: 0,
      },
      shipping: {
        type: Number,
        default: 0,
        min: 0,
      },
      discount: {
        amount: {
          type: Number,
          default: 0,
          min: 0,
        },
        code: String,
        description: String,
      },
      fees: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Payment method information
    paymentMethod: {
      type: {
        type: String,
        required: true,
        enum: ["card", "bank_transfer", "digital_wallet", "buy_now_pay_later"],
      },
      card: {
        last4: String,
        brand: {
          type: String,
          enum: [
            "visa",
            "mastercard",
            "amex",
            "discover",
            "diners",
            "jcb",
            "unionpay",
          ],
        },
        expMonth: Number,
        expYear: Number,
        funding: {
          type: String,
          enum: ["credit", "debit", "prepaid", "unknown"],
        },
        country: String,
      },
      billingAddress: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
    },

    // Transaction status
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "canceled",
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
        "partial_refund",
        "refunded",
      ],
      default: "pending",
    },

    // What was purchased
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        itemType: {
          type: String,
          required: true,
          enum: [
            "menswear",
            "womenswear",
            "kidswear",
            "stylecombo",
            "subscription",
            "service",
          ],
        },
        name: {
          type: String,
          required: true,
        },
        description: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        brand: String,
        size: String,
        color: String,
        sku: String,
        image: String,
      },
    ],

    // Purchase context
    purchaseType: {
      type: String,
      required: true,
      enum: [
        "individual_item",
        "outfit_combo",
        "bulk_purchase",
        "subscription",
        "gift",
        "pre_order",
      ],
    },

    // Shipping information
    shipping: {
      address: {
        name: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        phone: String,
      },
      method: {
        type: String,
        enum: ["standard", "express", "overnight", "pickup", "digital"],
      },
      cost: {
        type: Number,
        default: 0,
        min: 0,
      },
      estimatedDelivery: Date,
      trackingNumber: String,
      carrier: String,
    },

    // Receipt and invoice
    receipt: {
      receiptNumber: {
        type: String,
        unique: true,
      },
      receiptUrl: String, // Stripe receipt URL
      invoiceId: String,
      downloadUrl: String,
    },

    // Refund information
    refunds: [
      {
        refundId: String, // Stripe refund ID
        amount: {
          type: Number,
          min: 0,
        },
        reason: {
          type: String,
          enum: [
            "requested_by_customer",
            "duplicate",
            "fraudulent",
            "subscription_canceled",
            "product_unsatisfactory",
            "other",
          ],
        },
        description: String,
        status: {
          type: String,
          enum: ["pending", "succeeded", "failed", "canceled"],
        },
        processedAt: Date,
        expectedAt: Date,
      },
    ],

    // Budget integration
    budget: {
      budgetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Budget",
      },
      category: {
        type: String,
        enum: ["menswear", "womenswear", "kidswear", "accessories", "footwear"],
      },
      occasion: String,
      impactOnBudget: Number, // How much this affects the budget
    },

    // Payment timeline
    timeline: {
      createdAt: {
        type: Date,
        default: Date.now,
      },
      authorizedAt: Date,
      capturedAt: Date,
      succeededAt: Date,
      failedAt: Date,
      canceledAt: Date,
      refundedAt: Date,
    },

    // Error handling
    error: {
      code: String,
      message: String,
      type: String,
      declineCode: String, // Card decline codes
      networkStatus: String,
    },

    // Additional metadata
    metadata: {
      source: {
        type: String,
        enum: ["web", "mobile_app", "api", "admin"],
        default: "web",
      },
      userAgent: String,
      ipAddress: String,
      sessionId: String,
      orderSource: String, // cart, wishlist, quick-buy, etc.
      campaignId: String, // Marketing campaign tracking
      affiliateId: String,
      notes: String,
    },

    // Subscription related (if applicable)
    subscription: {
      subscriptionId: String,
      planId: String,
      planName: String,
      billingCycle: {
        type: String,
        enum: ["monthly", "quarterly", "annually"],
      },
      nextBillingDate: Date,
      isRecurring: {
        type: Boolean,
        default: false,
      },
    },

    // Fraud prevention
    fraudDetection: {
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
      },
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      checks: {
        cvcCheck: String, // pass, fail, unavailable, unchecked
        addressLineCheck: String,
        postalCodeCheck: String,
      },
      flagged: {
        type: Boolean,
        default: false,
      },
      flagReason: String,
    },

    // Analytics and reporting
    analytics: {
      processingTime: Number, // Time taken to process payment in milliseconds
      attemptCount: {
        type: Number,
        default: 1,
      },
      conversionSource: String, // Where the user came from before purchasing
      deviceType: {
        type: String,
        enum: ["desktop", "mobile", "tablet"],
      },
      paymentFlow: String, // checkout_flow, one_click, saved_payment, etc.
    },

    // Communication
    notifications: {
      confirmationSent: {
        type: Boolean,
        default: false,
      },
      confirmationSentAt: Date,
      receiptSent: {
        type: Boolean,
        default: false,
      },
      receiptSentAt: Date,
      failureNotificationSent: {
        type: Boolean,
        default: false,
      },
    },
    // External references
    externalReferences: {
      orderId: String, // Internal order ID if different from payment ID
      invoiceNumber: String,
      purchaseOrderNumber: String,
      merchantReference: String,
    },
    // Dispute information
    disputes: [
      {
        disputeId: String,
        amount: Number,
        reason: String,
        status: String,
        evidence: String,
        evidenceDetails: String,
        createdAt: Date,
        dueBy: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
// Generate unique receipt number
paymentSchema.pre("save", function (next) {
  if (!this.receipt.receiptNumber) {
    const timestamp = Date.now().toString();
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.receipt.receiptNumber = `RCP-${timestamp}-${randomSuffix}`;
  }
  next();
});

// Update timeline based on status changes
paymentSchema.pre("save", function (next) {
  const now = new Date();

  if (this.isModified("status")) {
    switch (this.status) {
      case "processing":
        if (!this.timeline.authorizedAt) {
          this.timeline.authorizedAt = now;
        }
        break;
      case "succeeded":
        if (!this.timeline.succeededAt) {
          this.timeline.succeededAt = now;
          this.timeline.capturedAt = now;
        }
        break;
      case "failed":
        if (!this.timeline.failedAt) {
          this.timeline.failedAt = now;
        }
        break;
      case "canceled":
        if (!this.timeline.canceledAt) {
          this.timeline.canceledAt = now;
        }
        break;
      case "refunded":
      case "partial_refund":
        if (!this.timeline.refundedAt) {
          this.timeline.refundedAt = now;
        }
        break;
    }
  }

  next();
});
// Calculate total amount from items
paymentSchema.methods.calculateTotalAmount = function () {
  const itemsTotal = this.items.reduce((total, item) => {
    return total + (item.totalPrice || item.unitPrice * item.quantity);
  }, 0);
  this.amount.subtotal = itemsTotal;
  this.amount.value =
    itemsTotal +
    this.amount.tax +
    this.amount.shipping +
    this.amount.fees -
    this.amount.discount.amount;
  return this.amount.value;
};
// Add refund
paymentSchema.methods.addRefund = function (refundData) {
  this.refunds.push({
    ...refundData,
    processedAt: new Date(),
  });
  // Update status based on refund amount
  const totalRefunded = this.refunds.reduce(
    (sum, refund) => sum + refund.amount,
    0
  );
  if (totalRefunded >= this.amount.value) {
    this.status = "refunded";
  } else if (totalRefunded > 0) {
    this.status = "partial_refund";
  }
  return this.save();
};
// Check if payment is successful
paymentSchema.methods.isSuccessful = function () {
  return this.status === "succeeded";
};
// Check if payment is failed
paymentSchema.methods.isFailed = function () {
  return ["failed", "canceled"].includes(this.status);
};
// Check if payment can be refunded
paymentSchema.methods.canBeRefunded = function () {
  if (!this.isSuccessful()) return false;
  const totalRefunded = this.refunds.reduce(
    (sum, refund) => sum + refund.amount,
    0
  );
  return totalRefunded < this.amount.value;
};
// Get payment summary for reporting
paymentSchema.methods.getSummary = function () {
  return {
    id: this._id,
    receiptNumber: this.receipt.receiptNumber,
    amount: this.amount.value,
    currency: this.amount.currency,
    status: this.status,
    paymentMethod: this.paymentMethod.type,
    items: this.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.totalPrice,
    })),
    createdAt: this.createdAt,
    processedAt: this.timeline.succeededAt || this.timeline.failedAt,
  };
};
// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function () {
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    LKR: "Rs.",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
    INR: "₹",
  };
  const symbol = currencySymbols[this.amount.currency] || this.amount.currency;
  return `${symbol}${this.amount.value.toFixed(2)}`;
});
// Indexing for better query performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ "receipt.receiptNumber": 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ "budget.budgetId": 1 });
paymentSchema.index({ "items.itemType": 1, "items.itemId": 1 });
module.exports = mongoose.model("Payment", paymentSchema);

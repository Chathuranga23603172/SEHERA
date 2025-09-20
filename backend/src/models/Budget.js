const mongoose = require("mongoose");
const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide budget name"],
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: ["monthly", "quarterly", "annual", "event-based", "category-based"],
    },
    period: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      year: Number,
      month: Number, // 1-12 for monthly budgets
      quarter: Number, // 1-4 for quarterly budgets
    },
    totalBudget: {
      amount: {
        type: Number,
        required: [true, "Please specify budget amount"],
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "LKR", "CAD", "AUD"],
      },
    },
    categoryBudgets: {
      menswear: {
        allocated: {
          type: Number,
          default: 0,
          min: 0,
        },
        spent: {
          type: Number,
          default: 0,
          min: 0,
        },
        percentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
      womenswear: {
        allocated: {
          type: Number,
          default: 0,
          min: 0,
        },
        spent: {
          type: Number,
          default: 0,
          min: 0,
        },
        percentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
      kidswear: {
        allocated: {
          type: Number,
          default: 0,
          min: 0,
        },
        spent: {
          type: Number,
          default: 0,
          min: 0,
        },
        percentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
      accessories: {
        allocated: {
          type: Number,
          default: 0,
          min: 0,
        },
        spent: {
          type: Number,
          default: 0,
          min: 0,
        },
        percentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
      footwear: {
        allocated: {
          type: Number,
          default: 0,
          min: 0,
        },
        spent: {
          type: Number,
          default: 0,
          min: 0,
        },
        percentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    },
    occasionBudgets: [
      {
        occasion: {
          type: String,
          enum: [
            "wedding",
            "interview",
            "business-meeting",
            "party",
            "vacation",
            "work",
            "formal-event",
            "everyday",
            "special-event",
            "holiday-shopping",
            "back-to-school",
            "seasonal-update",
          ],
        },
        allocated: {
          type: Number,
          min: 0,
          default: 0,
        },
        spent: {
          type: Number,
          min: 0,
          default: 0,
        },
        targetDate: Date,
        priority: {
          type: String,
          enum: ["low", "medium", "high", "urgent"],
          default: "medium",
        },
      },
    ],
    brandBudgets: [
      {
        brand: {
          type: String,
          required: true,
          trim: true,
        },
        allocated: {
          type: Number,
          min: 0,
          default: 0,
        },
        spent: {
          type: Number,
          min: 0,
          default: 0,
        },
        priority: {
          type: String,
          enum: ["luxury", "premium", "mid-range", "budget"],
          default: "mid-range",
        },
      },
    ],
    spending: {
      totalSpent: {
        type: Number,
        default: 0,
        min: 0,
      },
      remainingBudget: {
        type: Number,
        default: 0,
      },
      percentageUsed: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      averageSpendingPerDay: {
        type: Number,
        default: 0,
      },
      projectedSpending: {
        type: Number,
        default: 0,
      },
    },
    transactions: [
      {
        item: {
          itemId: mongoose.Schema.Types.ObjectId,
          itemType: {
            type: String,
            enum: ["menswear", "womenswear", "kidswear", "stylecombo"],
          },
          itemName: String,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        category: {
          type: String,
          enum: [
            "menswear",
            "womenswear",
            "kidswear",
            "accessories",
            "footwear",
          ],
        },
        brand: String,
        occasion: String,
        date: {
          type: Date,
          default: Date.now,
        },
        store: String,
        notes: String,
        paymentMethod: String,
      },
    ],
    alerts: {
      isEnabled: {
        type: Boolean,
        default: true,
      },
      thresholds: {
        warning: {
          percentage: {
            type: Number,
            default: 75,
            min: 1,
            max: 100,
          },
          isEnabled: {
            type: Boolean,
            default: true,
          },
        },
        danger: {
          percentage: {
            type: Number,
            default: 90,
            min: 1,
            max: 100,
          },
          isEnabled: {
            type: Boolean,
            default: true,
          },
        },
        exceeded: {
          isEnabled: {
            type: Boolean,
            default: true,
          },
        },
      },
      notifications: [
        {
          type: {
            type: String,
            enum: ["warning", "danger", "exceeded", "approaching-end"],
          },
          message: String,
          sentAt: {
            type: Date,
            default: Date.now,
          },
          acknowledged: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    goals: {
      savingsTarget: {
        type: Number,
        default: 0,
      },
      maxSpendingLimit: {
        type: Number,
        default: 0,
      },
      qualityOverQuantity: {
        type: Boolean,
        default: false,
      },
      sustainabilityGoals: {
        secondHandPercentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        ethicalBrandPercentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    },
    analytics: {
      topSpendingCategories: [
        {
          category: String,
          amount: Number,
          percentage: Number,
        },
      ],
      topSpendingBrands: [
        {
          brand: String,
          amount: Number,
          percentage: Number,
        },
      ],
      monthlyTrends: [
        {
          month: Number,
          year: Number,
          amount: Number,
        },
      ],
      averageItemCost: {
        menswear: Number,
        womenswear: Number,
        kidswear: Number,
      },
      costPerWear: {
        average: Number,
        bestValue: {
          itemId: mongoose.Schema.Types.ObjectId,
          itemType: String,
          value: Number,
        },
      },
    },
    status: {
      type: String,
      enum: ["active", "completed", "exceeded", "paused", "cancelled"],
      default: "active",
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringSettings: {
      frequency: {
        type: String,
        enum: ["monthly", "quarterly", "annually"],
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      adjustmentFactor: {
        type: Number,
        default: 1.0, // 1.0 = same amount, 1.1 = 10% increase
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate spending totals before saving
budgetSchema.pre("save", function (next) {
  // Calculate total spent from transactions
  this.spending.totalSpent = this.transactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);

  // Calculate remaining budget
  this.spending.remainingBudget =
    this.totalBudget.amount - this.spending.totalSpent;
  // Calculate percentage used
  this.spending.percentageUsed =
    this.totalBudget.amount > 0
      ? (this.spending.totalSpent / this.totalBudget.amount) * 100
      : 0;
  // Calculate category spending
  this.categoryBudgets.menswear.spent = this.transactions
    .filter((t) => t.category === "menswear")
    .reduce((sum, t) => sum + t.amount, 0);
  this.categoryBudgets.womenswear.spent = this.transactions
    .filter((t) => t.category === "womenswear")
    .reduce((sum, t) => sum + t.amount, 0);
  this.categoryBudgets.kidswear.spent = this.transactions
    .filter((t) => t.category === "kidswear")
    .reduce((sum, t) => sum + t.amount, 0);
  this.categoryBudgets.accessories.spent = this.transactions
    .filter((t) => t.category === "accessories")
    .reduce((sum, t) => sum + t.amount, 0);
  this.categoryBudgets.footwear.spent = this.transactions
    .filter((t) => t.category === "footwear")
    .reduce((sum, t) => sum + t.amount, 0);
  next();
});
// Add transaction method
budgetSchema.methods.addTransaction = function (transactionData) {
  this.transactions.push(transactionData);
  return this.save();
};
// Check if budget alerts should be triggered
budgetSchema.methods.checkAlerts = function () {
  const alerts = [];
  const percentageUsed = this.spending.percentageUsed;

  if (this.alerts.isEnabled) {
    if (percentageUsed >= 100 && this.alerts.thresholds.exceeded.isEnabled) {
      alerts.push({
        type: "exceeded",
        message: `Budget exceeded! You've spent ${percentageUsed.toFixed(
          1
        )}% of your 
budget.`,
        sentAt: new Date(),
      });
    } else if (
      percentageUsed >= this.alerts.thresholds.danger.percentage &&
      this.alerts.thresholds.danger.isEnabled
    ) {
      alerts.push({
        type: "danger",
        message: `Danger zone! You've spent ${percentageUsed.toFixed(
          1
        )}% of your 
budget.`,
        sentAt: new Date(),
      });
    } else if (
      percentageUsed >= this.alerts.thresholds.warning.percentage &&
      this.alerts.thresholds.warning.isEnabled
    ) {
      alerts.push({
        type: "warning",
        message: `Warning! You've spent ${percentageUsed.toFixed(
          1
        )}% of your budget.`,
        sentAt: new Date(),
      });
    }
  }

  // Add alerts to notifications
  alerts.forEach((alert) => {
    this.alerts.notifications.push(alert);
  });

  return alerts;
};

// Calculate projected spending based on current trend
budgetSchema.methods.calculateProjectedSpending = function () {
  const now = new Date();
  const daysElapsed = Math.ceil(
    (now - this.period.startDate) / (1000 * 60 * 60 * 24)
  );
  const totalDays = Math.ceil(
    (this.period.endDate - this.period.startDate) / (1000 * 60 * 60 * 24)
  );
  if (daysElapsed > 0) {
    this.spending.averageSpendingPerDay =
      this.spending.totalSpent / daysElapsed;
    this.spending.projectedSpending =
      this.spending.averageSpendingPerDay * totalDays;
  }
  return this.spending.projectedSpending;
};
// Get budget summary
budgetSchema.methods.getSummary = function () {
  return {
    name: this.name,
    type: this.type,
    totalBudget: this.totalBudget.amount,
    totalSpent: this.spending.totalSpent,
    remaining: this.spending.remainingBudget,
    percentageUsed: this.spending.percentageUsed,
    status: this.status,
    daysRemaining: Math.ceil(
      (this.period.endDate - Date.now()) / (1000 * 60 * 60 * 24)
    ),
    isOverBudget: this.spending.totalSpent > this.totalBudget.amount,
  };
};
// Generate spending report
budgetSchema.methods.generateSpendingReport = function () {
  const categorySpending = {
    menswear: this.categoryBudgets.menswear.spent,
    womenswear: this.categoryBudgets.womenswear.spent,
    kidswear: this.categoryBudgets.kidswear.spent,
    accessories: this.categoryBudgets.accessories.spent,
    footwear: this.categoryBudgets.footwear.spent,
  };

  // Calculate top spending categories
  const topCategories = Object.entries(categorySpending)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        this.spending.totalSpent > 0
          ? (amount / this.spending.totalSpent) * 100
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate brand spending
  const brandSpending = {};
  this.transactions.forEach((transaction) => {
    if (transaction.brand) {
      brandSpending[transaction.brand] =
        (brandSpending[transaction.brand] || 0) + transaction.amount;
    }
  });

  const topBrands = Object.entries(brandSpending)
    .map(([brand, amount]) => ({
      brand,
      amount,
      percentage:
        this.spending.totalSpent > 0
          ? (amount / this.spending.totalSpent) * 100
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  return {
    summary: this.getSummary(),
    categoryBreakdown: topCategories,
    brandBreakdown: topBrands,
    recentTransactions: this.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10),
    projectedSpending: this.calculateProjectedSpending(),
  };
};

// Check if budget period is active
budgetSchema.methods.isActive = function () {
  const now = new Date();
  return (
    now >= this.period.startDate &&
    now <= this.period.endDate &&
    this.status === "active"
  );
};
// Update status based on dates and spending
budgetSchema.methods.updateStatus = function () {
  const now = new Date();
  if (now > this.period.endDate) {
    this.status = "completed";
  } else if (this.spending.totalSpent > this.totalBudget.amount) {
    this.status = "exceeded";
  } else if (now >= this.period.startDate && now <= this.period.endDate) {
    this.status = "active";
  }
  return this.status;
};
// Indexing for better query performance
budgetSchema.index({ user: 1, type: 1 });
budgetSchema.index({ user: 1, status: 1 });
budgetSchema.index({ user: 1, "period.startDate": 1, "period.endDate": 1 });
budgetSchema.index({ "transactions.date": 1 });
module.exports = mongoose.model("Budget", budgetSchema);

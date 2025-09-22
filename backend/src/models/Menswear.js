const mongoose = require("mongoose");
const menswearSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide item name"],
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      required: [true, "Please specify item type"],
      enum: [
        "shirt",
        "pants",
        "suit",
        "jacket",
        "blazer",
        "t-shirt",
        "jeans",
        "shorts",
        "sweater",
        "hoodie",
        "polo",
        "dress-shirt",
        "chinos",
        "formal-pants",
        "casual-pants",
        "tie",
        "belt",
        "watch",
        "shoes",
        "boots",
        "sneakers",
        "formal-shoes",
        "underwear",
        "socks",
        "hat",
        "cap",
        "scarf",
        "gloves",
        "sunglasses",
        "other",
      ],
    },
    category: {
      main: {
        type: String,
        required: true,
        enum: ["formal", "casual", "sports", "party", "business"],
      },
      sub: {
        type: String,
        enum: ["dress", "accessories", "footwear", "eyewear", "underwear"],
      },
    },
    brand: {
      type: String,
      required: [true, "Please specify brand"],
      trim: true,
    },
    size: {
      type: String,
      required: [true, "Please specify size"],
    },
    color: {
      type: String,
      required: [true, "Please specify color"],
      trim: true,
    },
    price: {
      original: {
        type: Number,
        required: [true, "Please provide original price"],
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      discount: {
        percentage: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        amount: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
      final: {
        type: Number,
        min: 0,
      },
    },
    purchaseInfo: {
      date: {
        type: Date,
        default: Date.now,
      },
      store: {
        type: String,
        trim: true,
      },
      receipt: {
        type: String, // URL to receipt image
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String, // Cloudinary public ID
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    occasion: [
      {
        type: String,
        enum: [
          "wedding",
          "interview",
          "business-meeting",
          "date",
          "party",
          "casual-outing",
          "gym",
          "travel",
          "work",
          "formal-event",
          "religious",
          "sports",
          "vacation",
          "everyday",
        ],
      },
    ],
    season: [
      {
        type: String,
        enum: ["spring", "summer", "autumn", "winter", "all-season"],
      },
    ],
    material: {
      type: String,
      trim: true,
    },
    careInstructions: {
      type: String,
      trim: true,
    },
    usage: {
      count: {
        type: Number,
        default: 0,
      },
      lastWorn: {
        type: Date,
      },
      frequency: {
        type: String,
        enum: ["never", "rarely", "sometimes", "often", "daily"],
        default: "never",
      },
    },
    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair", "worn", "damaged"],
      default: "new",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      maxlength: 500,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    warranty: {
      hasWarranty: {
        type: Boolean,
        default: false,
      },
      expiryDate: Date,
      provider: String,
    },
  },
  {
    timestamps: true,
  }
);
// Calculate final price before saving
menswearSchema.pre("save", function (next) {
  if (this.price.discount.percentage > 0) {
    this.price.final =
      this.price.original * (1 - this.price.discount.percentage / 100);
  } else if (this.price.discount.amount > 0) {
    this.price.final = this.price.original - this.price.discount.amount;
  } else {
    this.price.final = this.price.original;
  }
  next();
});
// Update usage frequency based on count
menswearSchema.methods.updateUsageFrequency = function () {
  const count = this.usage.count;
  if (count === 0) {
    this.usage.frequency = "never";
  } else if (count <= 5) {
    this.usage.frequency = "rarely";
  } else if (count <= 15) {
    this.usage.frequency = "sometimes";
  } else if (count <= 30) {
    this.usage.frequency = "often";
  } else {
    this.usage.frequency = "daily";
  }
};
// Increment usage count
menswearSchema.methods.wear = function () {
  this.usage.count += 1;
  this.usage.lastWorn = new Date();
  this.updateUsageFrequency();
  return this.save();
};
// Calculate cost per wear
menswearSchema.virtual("costPerWear").get(function () {
  return this.usage.count > 0
    ? (this.price.final / this.usage.count).toFixed(2)
    : this.price.final;
});
// Indexing for better query performance
menswearSchema.index({ user: 1, type: 1 });
menswearSchema.index({ user: 1, category: 1 });
menswearSchema.index({ user: 1, brand: 1 });
menswearSchema.index({ user: 1, occasion: 1 });
menswearSchema.index({ user: 1, season: 1 });
module.exports = mongoose.model("Menswear", menswearSchema);

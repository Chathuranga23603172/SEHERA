const mongoose = require("mongoose");
const womenswearSchema = new mongoose.Schema(
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
        "dress",
        "blouse",
        "skirt",
        "pants",
        "jeans",
        "leggings",
        "shorts",
        "top",
        "t-shirt",
        "tank-top",
        "sweater",
        "cardigan",
        "jacket",
        "blazer",
        "coat",
        "jumpsuit",
        "romper",
        "suit",
        "lingerie",
        "bra",
        "underwear",
        "swimwear",
        "activewear",
        "shoes",
        "heels",
        "flats",
        "boots",
        "sneakers",
        "sandals",
        "handbag",
        "purse",
        "clutch",
        "backpack",
        "jewelry",
        "necklace",
        "earrings",
        "bracelet",
        "ring",
        "watch",
        "scarf",
        "belt",
        "hat",
        "sunglasses",
        "tights",
        "stockings",
        "other",
      ],
    },
    category: {
      main: {
        type: String,
        required: true,
        enum: [
          "formal",
          "casual",
          "party",
          "business",
          "sports",
          "evening",
          "maternity",
        ],
      },
      sub: {
        type: String,
        enum: [
          "dress",
          "accessories",
          "footwear",
          "jewelry",
          "bags",
          "lingerie",
          "activewear",
        ],
      },
    },
    brand: {
      type: String,
      required: [true, "Please specify brand"],
      trim: true,
    },
    size: {
      clothing: String, // XS, S, M, L, XL, etc.
      shoes: String, // 6, 7, 8, etc.
      jewelry: String, // Ring size, etc.
      bra: {
        band: String, // 32, 34, 36, etc.
        cup: String, // A, B, C, etc.
      },
    },
    color: {
      primary: {
        type: String,
        required: [true, "Please specify primary color"],
        trim: true,
      },
      secondary: String,
      pattern: {
        type: String,
        enum: [
          "solid",
          "striped",
          "polka-dot",
          "floral",
          "geometric",
          "animal-print",
          "abstract",
          "plaid",
          "other",
        ],
      },
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
      onSale: {
        type: Boolean,
        default: false,
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
        description: String,
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
          "cocktail",
          "gala",
          "brunch",
          "dinner",
          "casual-outing",
          "gym",
          "yoga",
          "travel",
          "work",
          "formal-event",
          "religious",
          "vacation",
          "everyday",
          "maternity",
          "baby-shower",
          "girls-night",
          "shopping",
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
      primary: String,
      secondary: String,
      blend: String,
      care: {
        washable: {
          type: Boolean,
          default: true,
        },
        dryCleanOnly: {
          type: Boolean,
          default: false,
        },
        delicate: {
          type: Boolean,
          default: false,
        },
      },
    },
    fit: {
      type: String,
      enum: ["tight", "fitted", "regular", "loose", "oversized", "plus-size"],
    },
    bodyType: [
      {
        type: String,
        enum: [
          "petite",
          "tall",
          "curvy",
          "plus-size",
          "maternity",
          "athletic",
          "pear",
          "apple",
          "hourglass",
          "rectangle",
        ],
      },
    ],
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
      events: [
        {
          date: Date,
          occasion: String,
          location: String,
        },
      ],
    },
    condition: {
      type: String,
      enum: [
        "new",
        "like-new",
        "good",
        "fair",
        "worn",
        "needs-repair",
        "damaged",
      ],
      default: "new",
    },
    sustainability: {
      ethicalBrand: {
        type: Boolean,
        default: false,
      },
      sustainable: {
        type: Boolean,
        default: false,
      },
      vintage: {
        type: Boolean,
        default: false,
      },
      secondHand: {
        type: Boolean,
        default: false,
      },
    },
    styling: {
      versatility: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
      comfort: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
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
    alterations: [
      {
        date: Date,
        type: String,
        cost: Number,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);
// Calculate final price before saving
womenswearSchema.pre("save", function (next) {
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
womenswearSchema.methods.updateUsageFrequency = function () {
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
// Record wearing event
womenswearSchema.methods.wear = function (occasion = "", location = "") {
  this.usage.count += 1;
  this.usage.lastWorn = new Date();
  if (occasion || location) {
    this.usage.events.push({
      date: new Date(),
      occasion,
      location,
    });
  }
  this.updateUsageFrequency();
  return this.save();
};
// Calculate cost per wear
womenswearSchema.virtual("costPerWear").get(function () {
  return this.usage.count > 0
    ? (this.price.final / this.usage.count).toFixed(2)
    : this.price.final;
});
// Calculate sustainability score
womenswearSchema.virtual("sustainabilityScore").get(function () {
  let score = 0;
  if (this.sustainability.ethicalBrand) score += 25;
  if (this.sustainability.sustainable) score += 25;
  if (this.sustainability.vintage) score += 25;
  if (this.sustainability.secondHand) score += 25;
  return score;
});
// Check if item needs attention (not worn recently)
womenswearSchema.methods.needsAttention = function () {
  if (!this.usage.lastWorn) return true;
  const daysSinceWorn = Math.floor(
    (Date.now() - this.usage.lastWorn) / (1000 * 60 * 60 * 24)
  );
  return daysSinceWorn > 90; // Not worn in 3 months
};
// Indexing for better query performance
womenswearSchema.index({ user: 1, type: 1 });
womenswearSchema.index({ user: 1, category: 1 });
womenswearSchema.index({ user: 1, brand: 1 });
womenswearSchema.index({ user: 1, occasion: 1 });
womenswearSchema.index({ user: 1, season: 1 });
womenswearSchema.index({ user: 1, "color.primary": 1 });
module.exports = mongoose.model("Womenswear", womenswearSchema);

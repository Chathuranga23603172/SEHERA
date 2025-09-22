const mongoose = require("mongoose");

const styleComboSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide outfit name"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    items: {
      menswear: [
        {
          item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menswear",
          },
          category: String, // shirt, pants, shoes, etc.
          required: {
            type: Boolean,
            default: false,
          },
        },
      ],
      womenswear: [
        {
          item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Womenswear",
          },
          category: String, // dress, top, bottom, shoes, etc.
          required: {
            type: Boolean,
            default: false,
          },
        },
      ],
      kidswear: [
        {
          item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Kidswear",
          },
          category: String,
          childName: String,
          required: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    totalCost: {
      original: {
        type: Number,
        default: 0,
      },
      discounted: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    style: {
      type: {
        type: String,
        required: true,
        enum: [
          "casual",
          "formal",
          "business",
          "smart-casual",
          "streetwear",
          "bohemian",
          "minimalist",
          "vintage",
          "sporty",
          "elegant",
          "edgy",
          "romantic",
          "preppy",
          "gothic",
          "hipster",
          "classic",
          "trendy",
          "artsy",
          "glamorous",
          "laid-back",
          "professional",
          "party",
          "vacation",
          "date-night",
          "family-friendly",
        ],
      },
      mood: {
        type: String,
        enum: [
          "confident",
          "comfortable",
          "playful",
          "sophisticated",
          "relaxed",
          "bold",
          "feminine",
          "masculine",
          "neutral",
        ],
      },
      colorPalette: [
        {
          type: String,
        },
      ],
      theme: String,
    },
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
          "religious-ceremony",
          "vacation",
          "everyday",
          "birthday-party",
          "graduation",
          "baby-shower",
          "girls-night",
          "boys-night",
          "family-gathering",
          "holiday",
          "photoshoot",
          "conference",
          "networking",
          "first-date",
          "anniversary",
          "clubbing",
          "shopping",
          "outdoor-activity",
          "sports-event",
          "concert",
          "theater",
          "art-gallery",
        ],
      },
    ],
    season: [
      {
        type: String,
        enum: ["spring", "summer", "autumn", "winter", "all-season"],
      },
    ],
    weather: [
      {
        type: String,
        enum: [
          "sunny",
          "rainy",
          "cold",
          "hot",
          "humid",
          "windy",
          "snowy",
          "mild",
        ],
      },
    ],
    targetAudience: {
      ageGroup: {
        type: String,
        enum: ["teens", "young-adults", "adults", "seniors", "all-ages"],
      },
      gender: {
        type: String,
        enum: ["male", "female", "unisex", "family"],
      },
      bodyType: String,
    },
    images: [
      {
        url: String,
        publicId: String, // Cloudinary public ID
        type: {
          type: String,
          enum: ["outfit-photo", "flat-lay", "inspiration", "detail"],
        },
        caption: String,
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
      wearHistory: [
        {
          date: Date,
          occasion: String,
          location: String,
          rating: {
            type: Number,
            min: 1,
            max: 5,
          },
          notes: String,
          photos: [String], // URLs to photos of the actual wearing
        },
      ],
      frequency: {
        type: String,
        enum: ["never", "rarely", "sometimes", "often", "frequently"],
        default: "never",
      },
    },
    ratings: {
      comfort: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
      style: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
      versatility: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
      overall: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
    },
    sharing: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      shareableLink: String,
      socialMediaShared: [
        {
          platform: {
            type: String,
            enum: ["instagram", "facebook", "twitter", "pinterest", "tiktok"],
          },
          sharedAt: Date,
          postUrl: String,
        },
      ],
      likes: {
        type: Number,
        default: 0,
      },
      views: {
        type: Number,
        default: 0,
      },
    },
    alternatives: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
        },
        itemType: {
          type: String,
          enum: ["menswear", "womenswear", "kidswear"],
        },
        reason: String, // "similar style", "different color", etc.
        category: String,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    notes: {
      styling: String,
      improvements: String,
      compliments: String,
      general: String,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    virtualTryOn: {
      hasVirtualModel: {
        type: Boolean,
        default: false,
      },
      modelSettings: {
        bodyType: String,
        skinTone: String,
        hairColor: String,
        height: Number,
        weight: Number,
      },
      virtualImages: [String], // URLs to virtual try-on images
    },
    analytics: {
      costPerWear: Number,
      sustainability: {
        score: Number,
        factors: [String],
      },
      versatilityScore: Number, // How many different occasions this can be worn to
      completeness: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total cost before saving
styleComboSchema.pre("save", function (next) {
  // This would need to populate items and calculate, for now just set to 0
  this.totalCost.original = 0;
  this.totalCost.discounted = 0;
  next();
});

// Method to calculate total cost (call after populating items)
styleComboSchema.methods.calculateTotalCost = function () {
  let originalTotal = 0;
  let discountedTotal = 0;

  // Sum menswear items
  this.items.menswear.forEach((itemRef) => {
    if (itemRef.item && itemRef.item.price) {
      originalTotal += itemRef.item.price.original || 0;
      discountedTotal +=
        itemRef.item.price.final || itemRef.item.price.original || 0;
    }
  });

  // Sum womenswear items
  this.items.womenswear.forEach((itemRef) => {
    if (itemRef.item && itemRef.item.price) {
      originalTotal += itemRef.item.price.original || 0;
      discountedTotal +=
        itemRef.item.price.final || itemRef.item.price.original || 0;
    }
  });

  // Sum kidswear items
  this.items.kidswear.forEach((itemRef) => {
    if (itemRef.item && itemRef.item.price) {
      originalTotal += itemRef.item.price.original || 0;
      discountedTotal +=
        itemRef.item.price.final || itemRef.item.price.original || 0;
    }
  });

  this.totalCost.original = originalTotal;
  this.totalCost.discounted = discountedTotal;

  return { originalTotal, discountedTotal };
};

// Record wearing event
styleComboSchema.methods.wear = function (
  occasion = "",
  location = "",
  rating = null,
  notes = ""
) {
  this.usage.count += 1;
  this.usage.lastWorn = new Date();

  const wearEvent = {
    date: new Date(),
    occasion,
    location,
    notes,
  };

  if (rating) {
    wearEvent.rating = rating;
  }
  this.usage.wearHistory.push(wearEvent);
  this.updateUsageFrequency();
  return this.save();
};
// Update usage frequency based on count
styleComboSchema.methods.updateUsageFrequency = function () {
  const count = this.usage.count;
  if (count === 0) {
    this.usage.frequency = "never";
  } else if (count <= 3) {
    this.usage.frequency = "rarely";
  } else if (count <= 8) {
    this.usage.frequency = "sometimes";
  } else if (count <= 15) {
    this.usage.frequency = "often";
  } else {
    this.usage.frequency = "frequently";
  }
};
// Calculate cost per wear
styleComboSchema.virtual("costPerWear").get(function () {
  return this.usage.count > 0
    ? (this.totalCost.discounted / this.usage.count).toFixed(2)
    : this.totalCost.discounted;
});
// Calculate versatility score based on occasions and seasons
styleComboSchema.methods.calculateVersatilityScore = function () {
  let score = 0;
  score += this.occasion.length * 10; // 10 points per occasion
  score += this.season.length * 5; // 5 points per season
  score += this.weather.length * 3; // 3 points per weather type
  this.analytics.versatilityScore = Math.min(score, 100); // Cap at 100
  return this.analytics.versatilityScore;
};
// Check outfit completeness
styleComboSchema.methods.checkCompleteness = function () {
  let completeness = 0;
  const totalItems =
    this.items.menswear.length +
    this.items.womenswear.length +
    this.items.kidswear.length;
  if (totalItems > 0) completeness += 30;
  if (this.name && this.name.trim()) completeness += 20;
  if (this.occasion && this.occasion.length > 0) completeness += 20;
  if (this.style.type) completeness += 15;
  if (this.images && this.images.length > 0) completeness += 15;
  this.analytics.completeness = completeness;
  return completeness;
};
// Generate shareable link
styleComboSchema.methods.generateShareableLink = function () {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  this.sharing.shareableLink = `${baseUrl}/outfits/shared/${this._id}`;
  return this.sharing.shareableLink;
};
// Add view count
styleComboSchema.methods.addView = function () {
  this.sharing.views += 1;
  return this.save();
};
// Add like
styleComboSchema.methods.addLike = function () {
  this.sharing.likes += 1;
  return this.save();
};
// Indexing for better query performance
styleComboSchema.index({ user: 1, name: 1 });
styleComboSchema.index({ user: 1, "style.type": 1 });
styleComboSchema.index({ user: 1, occasion: 1 });
styleComboSchema.index({ user: 1, season: 1 });
styleComboSchema.index({ user: 1, tags: 1 });
styleComboSchema.index({ user: 1, isFavorite: 1 });
styleComboSchema.index({ "sharing.isPublic": 1 });
module.exports = mongoose.model("StyleCombo", styleComboSchema);

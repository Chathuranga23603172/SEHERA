const mongoose = require("mongoose");
const kidswearSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    childInfo: {
      name: {
        type: String,
        required: [true, "Please provide child name"],
        trim: true,
      },
      gender: {
        type: String,
        enum: ["boy", "girl", "unisex"],
        required: true,
      },
      dateOfBirth: {
        type: Date,
        required: [true, "Please provide child date of birth"],
      },
      currentAge: {
        years: Number,
        months: Number,
      },
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
        "onesie",
        "bodysuit",
        "romper",
        "dress",
        "shirt",
        "t-shirt",
        "blouse",
        "tank-top",
        "sweater",
        "hoodie",
        "cardigan",
        "jacket",
        "coat",
        "vest",
        "pants",
        "jeans",
        "leggings",
        "shorts",
        "skirt",
        "pajamas",
        "sleepwear",
        "underwear",
        "diaper",
        "bib",
        "hat",
        "cap",
        "mittens",
        "gloves",
        "scarf",
        "socks",
        "tights",
        "shoes",
        "boots",
        "sneakers",
        "sandals",
        "slippers",
        "school-uniform",
        "sports-uniform",
        "swimwear",
        "raincoat",
        "snow-suit",
        "costume",
        "other",
      ],
    },
    category: {
      main: {
        type: String,
        required: true,
        enum: [
          "school",
          "casual",
          "formal",
          "sports",
          "sleepwear",
          "special-occasion",
          "seasonal",
        ],
      },
      sub: {
        type: String,
        enum: [
          "everyday",
          "playwear",
          "dress-up",
          "outdoor",
          "accessories",
          "footwear",
          "underwear",
        ],
      },
    },
    ageGroup: {
      type: String,
      required: true,
      enum: ["baby", "toddler", "kids", "teens"], // baby: 0-2, toddler: 2-4, kids: 5-12, teens: 13-18
      default: "baby",
    },
    growthStage: {
      category: {
        type: String,
        enum: [
          "0-6months",
          "6-12months",
          "12-18months",
          "18-24months",
          "2-3years",
          "3-4years",
          "4-6years",
          "6-8years",
          "8-10years",
          "10-12years",
          "12-14years",
          "14-16years",
          "16-18years",
        ],
        required: true,
      },
      notes: {
        type: String,
        maxlength: 200,
      },
    },
    brand: {
      type: String,
      required: [true, "Please specify brand"],
      trim: true,
    },
    size: {
      label: {
        type: String,
        required: [true, "Please specify size"],
      },
      measurements: {
        chest: Number,
        waist: Number,
        length: Number,
        sleeve: Number,
        inseam: Number,
      },
      shoeSize: String,
      fitNotes: String,
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
          "cartoon",
          "animal",
          "floral",
          "geometric",
          "camouflage",
          "tie-dye",
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
      giftReceived: {
        type: Boolean,
        default: false,
      },
      giftGiver: String,
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
          "everyday",
          "school",
          "playground",
          "birthday-party",
          "wedding",
          "family-gathering",
          "religious-ceremony",
          "holiday",
          "vacation",
          "sports",
          "dance",
          "music-lesson",
          "doctor-visit",
          "sleepover",
          "photoshoot",
          "graduation",
          "first-day-school",
          "halloween",
          "christmas",
          "formal-event",
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
      isHypoallergenic: {
        type: Boolean,
        default: false,
      },
      isOrganic: {
        type: Boolean,
        default: false,
      },
      care: {
        washable: {
          type: Boolean,
          default: true,
        },
        temperature: String, // warm, cold, hot
        tumbleDry: {
          type: Boolean,
          default: true,
        },
        ironSafe: {
          type: Boolean,
          default: true,
        },
      },
    },
    durability: {
      rating: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
      expectedLifespan: {
        type: String,
        enum: ["3-months", "6-months", "1-year", "2-years", "3+ years"],
      },
      condition: {
        type: String,
        enum: [
          "new",
          "like-new",
          "good",
          "fair",
          "outgrown",
          "worn",
          "stained",
          "torn",
          "needs-repair",
        ],
        default: "new",
      },
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
      sizeStatus: {
        type: String,
        enum: [
          "fits-perfectly",
          "slightly-small",
          "slightly-large",
          "too-small",
          "too-large",
          "outgrown",
        ],
        default: "fits-perfectly",
      },
    },
    sizeTracking: {
      purchaseDate: Date,
      firstWearDate: Date,
      outgrownDate: Date,
      sizingHistory: [
        {
          date: Date,
          status: String,
          childAge: {
            years: Number,
            months: Number,
          },
          notes: String,
        },
      ],
    },
    handMeDown: {
      isHandMeDown: {
        type: Boolean,
        default: false,
      },
      from: String, // Who gave it
      canPassDown: {
        type: Boolean,
        default: true,
      },
      passedTo: String, // Who received it
    },
    safety: {
      hasSmallParts: {
        type: Boolean,
        default: false,
      },
      flameRetardant: {
        type: Boolean,
        default: false,
      },
      chokeHazard: {
        type: Boolean,
        default: false,
      },
      ageAppropriate: {
        type: Boolean,
        default: true,
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
    alerts: {
      sizeUpgrade: {
        isEnabled: {
          type: Boolean,
          default: true,
        },
        lastAlertDate: Date,
      },
      seasonReminder: {
        isEnabled: {
          type: Boolean,
          default: true,
        },
        lastAlertDate: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate child's current age
kidswearSchema.methods.calculateCurrentAge = function () {
  const today = new Date();
  const birthDate = new Date(this.childInfo.dateOfBirth);
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  this.childInfo.currentAge = { years, months };
  return { years, months };
};
// Calculate final price before saving
kidswearSchema.pre("save", function (next) {
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
kidswearSchema.methods.updateUsageFrequency = function () {
  const count = this.usage.count;
  if (count === 0) {
    this.usage.frequency = "never";
  } else if (count <= 10) {
    this.usage.frequency = "rarely";
  } else if (count <= 25) {
    this.usage.frequency = "sometimes";
  } else if (count <= 50) {
    this.usage.frequency = "often";
  } else {
    this.usage.frequency = "daily";
  }
};
// Record wearing event
kidswearSchema.methods.wear = function () {
  this.usage.count += 1;
  this.usage.lastWorn = new Date();
  this.updateUsageFrequency();
  return this.save();
};
// Check if item needs size upgrade
kidswearSchema.methods.checkSizeUpgrade = function () {
  const currentAge = this.calculateCurrentAge();
  const ageInMonths = currentAge.years * 12 + currentAge.months;
  // Simple logic: if child is much older than when item was purchased, might need upgrade
  const purchaseAge = this.sizeTracking.purchaseDate;
  if (purchaseAge) {
    const purchaseAgeInMonths = Math.floor(
      (Date.now() - purchaseAge) / (1000 * 60 * 60 * 24 * 30)
    );
    return purchaseAgeInMonths > 6; // More than 6 months old purchase
  }
  return (
    this.usage.sizeStatus === "too-small" ||
    this.usage.sizeStatus === "outgrown"
  );
};
// Mark as outgrown
kidswearSchema.methods.markOutgrown = function () {
  this.usage.sizeStatus = "outgrown";
  this.sizeTracking.outgrownDate = new Date();
  this.durability.condition = "outgrown";
  this.isActive = false;
  return this.save();
};
// Calculate cost per wear
kidswearSchema.virtual("costPerWear").get(function () {
  return this.usage.count > 0
    ? (this.price.final / this.usage.count).toFixed(2)
    : this.price.final;
});
// Check if needs attention (not worn recently or size issues)
kidswearSchema.methods.needsAttention = function () {
  if (this.checkSizeUpgrade()) return true;
  if (!this.usage.lastWorn) return true;
  const daysSinceWorn = Math.floor(
    (Date.now() - this.usage.lastWorn) / (1000 * 60 * 60 * 24)
  );
  return daysSinceWorn > 30; // Not worn in 1 month
};
// Determine age group based on child's current age
kidswearSchema.methods.determineAgeGroup = function () {
  const age = this.calculateCurrentAge();
  const totalMonths = age.years * 12 + age.months;
  if (totalMonths <= 24) return "baby";
  if (totalMonths <= 48) return "toddler";
  if (age.years <= 12) return "kids";
  return "teens";
};
// Auto-update age group before saving
kidswearSchema.pre("save", function (next) {
  if (this.childInfo.dateOfBirth) {
    this.calculateCurrentAge();
    this.ageGroup = this.determineAgeGroup();
  }
  next();
});
// Indexing for better query performance
kidswearSchema.index({ user: 1, "childInfo.name": 1 });
kidswearSchema.index({ user: 1, type: 1 });
kidswearSchema.index({ user: 1, ageGroup: 1 });
kidswearSchema.index({ user: 1, category: 1 });
kidswearSchema.index({ user: 1, "usage.sizeStatus": 1 });
kidswearSchema.index({ user: 1, season: 1 });
module.exports = mongoose.model("Kidswear", kidswearSchema);

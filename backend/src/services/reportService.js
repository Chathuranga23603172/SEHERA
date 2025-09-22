const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const fs = require("fs").promises;
const path = require("path");
// Generate spending report by category
const generateSpendingReport = async (userId, dateRange, format = "json") => {
  try {
    const { startDate, endDate } = dateRange;
    // Import models (assuming they're available)
    const Menswear = require("../models/Menswear");
    const Womenswear = require("../models/Womenswear");
    const Kidswear = require("../models/Kidswear");
    const Budget = require("../models/Budget");

    // Aggregate spending data
    const menswearSpending = await Menswear.aggregate([
      {
        $match: {
          userId: userId,
          purchaseDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$price" },
          itemCount: { $sum: 1 },
          items: {
            $push: {
              name: "$name",
              price: "$price",
              brand: "$brand",
              purchaseDate: "$purchaseDate",
            },
          },
        },
      },
    ]);

    const womenswearSpending = await Womenswear.aggregate([
      {
        $match: {
          userId: userId,
          purchaseDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$price" },
          itemCount: { $sum: 1 },
          items: {
            $push: {
              name: "$name",
              price: "$price",
              brand: "$brand",
              purchaseDate: "$purchaseDate",
            },
          },
        },
      },
    ]);

    const kidswearSpending = await Kidswear.aggregate([
      {
        $match: {
          userId: userId,
          purchaseDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$price" },
          itemCount: { $sum: 1 },
          items: {
            $push: {
              name: "$name",
              price: "$price",
              brand: "$brand",
              purchaseDate: "$purchaseDate",
            },
          },
        },
      },
    ]);

    // Get budget information
    const budget = await Budget.findOne({ userId, isActive: true });

    // Combine all spending data
    const allSpending = [
      ...menswearSpending.map((item) => ({ ...item, type: "menswear" })),
      ...womenswearSpending.map((item) => ({ ...item, type: "womenswear" })),
      ...kidswearSpending.map((item) => ({ ...item, type: "kidswear" })),
    ];

    // Calculate totals
    const totalSpent = allSpending.reduce(
      (sum, category) => sum + category.totalSpent,
      0
    );
    const totalItems = allSpending.reduce(
      (sum, category) => sum + category.itemCount,
      0
    );

    const reportData = {
      userId,
      dateRange: { startDate, endDate },
      totalSpent,
      totalItems,
      budgetAmount: budget ? budget.monthlyAmount : 0,
      budgetRemaining: budget ? budget.monthlyAmount - totalSpent : 0,
      spendingByCategory: allSpending,
      generatedAt: new Date(),
    };
    // Return data in requested format
    if (format === "pdf") {
      return await generatePDFReport(reportData);
    } else if (format === "excel") {
      return await generateExcelReport(reportData);
    }
    return reportData;
  } catch (error) {
    throw new Error(`Failed to generate spending report: ${error.message}`);
  }
};
// Generate budget analysis report
const generateBudgetAnalysisReport = async (userId, period = "monthly") => {
  try {
    const Budget = require("../models/Budget");
    const Menswear = require("../models/Menswear");
    const Womenswear = require("../models/Womenswear");
    const Kidswear = require("../models/Kidswear");

    let startDate, endDate;

    // Calculate date range based on period
    const now = new Date();
    if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === "quarterly") {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    } else if (period === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    // Get budget data
    const budget = await Budget.findOne({ userId, isActive: true });

    // Get all spending data for the period
    const allCollections = [
      { model: Menswear, type: "menswear" },
      { model: Womenswear, type: "womenswear" },
      { model: Kidswear, type: "kidswear" },
    ];

    let totalSpent = 0;
    const spendingByType = {};

    for (const collection of allCollections) {
      const spending = await collection.model.aggregate([
        {
          $match: {
            userId: userId,
            purchaseDate: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
      ]);

      const typeSpending = spending[0] || { total: 0, count: 0 };
      spendingByType[collection.type] = typeSpending;
      totalSpent += typeSpending.total;
    }

    const budgetAmount = budget ? budget.monthlyAmount : 0;
    const budgetUsed = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

    return {
      userId,
      period,
      dateRange: { startDate, endDate },
      budgetAmount,
      totalSpent,
      budgetRemaining: budgetAmount - totalSpent,
      budgetUsedPercentage: budgetUsed,
      spendingByType,
      isOverBudget: totalSpent > budgetAmount,
      generatedAt: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to generate budget analysis: ${error.message}`);
  }
};

// Generate outfit usage report
const generateOutfitUsageReport = async (userId, dateRange) => {
  try {
    const StyleCombo = require("../models/StyleCombo");
    const { startDate, endDate } = dateRange;

    const outfitUsage = await StyleCombo.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $project: {
          name: 1,
          eventType: 1,
          usageCount: 1,
          lastUsed: 1,
          items: 1,
          totalCost: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: "$item.price",
              },
            },
          },
        },
      },
      {
        $addFields: {
          costPerWear: {
            $cond: {
              if: { $gt: ["$usageCount", 0] },
              then: { $divide: ["$totalCost", "$usageCount"] },
              else: "$totalCost",
            },
          },
        },
      },
      { $sort: { usageCount: -1 } },
    ]);

    const totalOutfits = outfitUsage.length;
    const mostUsedOutfit = outfitUsage[0] || null;
    const leastUsedOutfits = outfitUsage.filter(
      (outfit) => outfit.usageCount === 0
    );
    const averageCostPerWear =
      outfitUsage.reduce((sum, outfit) => sum + outfit.costPerWear, 0) /
        totalOutfits || 0;

    return {
      userId,
      dateRange: { startDate, endDate },
      totalOutfits,
      mostUsedOutfit,
      leastUsedOutfits: leastUsedOutfits.length,
      averageCostPerWear,
      outfitDetails: outfitUsage,
      generatedAt: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to generate outfit usage report: ${error.message}`);
  }
};
// Generate sustainability report
const generateSustainabilityReport = async (userId) => {
  try {
    const Menswear = require("../models/Menswear");
    const Womenswear = require("../models/Womenswear");
    const Kidswear = require("../models/Kidswear");
    const allCollections = [
      { model: Menswear, type: "menswear" },
      { model: Womenswear, type: "womenswear" },
      { model: Kidswear, type: "kidswear" },
    ];
    let totalItems = 0;
    let totalValue = 0;
    let totalUsage = 0;
    const sustainabilityMetrics = {};
    for (const collection of allCollections) {
      const items = await collection.model.find({ userId });

      const typeMetrics = {
        itemCount: items.length,
        totalValue: items.reduce((sum, item) => sum + item.price, 0),
        totalUsage: items.reduce(
          (sum, item) => sum + (item.usageCount || 0),
          0
        ),
        averageCostPerWear: 0,
        underutilizedItems: items.filter((item) => (item.usageCount || 0) < 5)
          .length,
      };

      if (typeMetrics.totalUsage > 0) {
        typeMetrics.averageCostPerWear =
          typeMetrics.totalValue / typeMetrics.totalUsage;
      }

      sustainabilityMetrics[collection.type] = typeMetrics;
      totalItems += typeMetrics.itemCount;
      totalValue += typeMetrics.totalValue;
      totalUsage += typeMetrics.totalUsage;
    }

    const overallCostPerWear = totalUsage > 0 ? totalValue / totalUsage : 0;
    const sustainabilityScore = calculateSustainabilityScore(
      sustainabilityMetrics,
      totalItems,
      totalUsage
    );

    return {
      userId,
      totalItems,
      totalValue,
      totalUsage,
      overallCostPerWear,
      sustainabilityScore,
      sustainabilityMetrics,
      recommendations: generateSustainabilityRecommendations(
        sustainabilityMetrics
      ),
      generatedAt: new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to generate sustainability report: ${error.message}`
    );
  }
};
// Calculate sustainability score
const calculateSustainabilityScore = (metrics, totalItems, totalUsage) => {
  if (totalItems === 0) return 0;
  const averageUsagePerItem = totalUsage / totalItems;
  const underutilizedPercentage =
    Object.values(metrics).reduce(
      (sum, metric) => sum + metric.underutilizedItems,
      0
    ) / totalItems;
  // Score based on usage frequency and underutilization
  let score = Math.min(averageUsagePerItem * 10, 50); // Max 50 points for usage
  score += Math.max(0, 50 - underutilizedPercentage * 100); // Max 50 points for utilization
  return Math.round(Math.min(score, 100));
};
// Generate sustainability recommendations
const generateSustainabilityRecommendations = (metrics) => {
  const recommendations = [];
  Object.entries(metrics).forEach(([type, metric]) => {
    if (metric.underutilizedItems > metric.itemCount * 0.3) {
      recommendations.push(`Consider wearing your ${type} items more frequently. 
${metric.underutilizedItems} items are underutilized.`);
    }
    if (metric.averageCostPerWear > 50) {
      recommendations.push(`Your ${type} cost per wear is high. Try creating more outfits 
with existing items.`);
    }
  });
  if (recommendations.length === 0) {
    recommendations.push(
      "Great job! You're making good use of your wardrobe items."
    );
  }
  return recommendations;
};
// Generate PDF report
const generatePDFReport = async (reportData) => {
  try {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {});
    // PDF Header
    doc.fontSize(20).text("Fashion Spending Report", 50, 50);
    doc
      .fontSize(12)
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);
    doc.text(
      `Period: ${reportData.dateRange.startDate.toLocaleDateString()} - 
${reportData.dateRange.endDate.toLocaleDateString()}`,
      50,
      100
    );
    // Summary section
    doc.fontSize(16).text("Summary", 50, 140);
    doc
      .fontSize(12)
      .text(`Total Spent: ${reportData.totalSpent.toFixed(2)}`, 50, 170)
      .text(`Budget Amount: ${reportData.budgetAmount.toFixed(2)}`, 50, 190)
      .text(
        `Budget Remaining: ${reportData.budgetRemaining.toFixed(2)}`,
        50,
        210
      )
      .text(`Total Items Purchased: ${reportData.totalItems}`, 50, 230);
    // Category breakdown
    doc.fontSize(16).text("Spending by Category", 50, 270);
    let yPosition = 300;

    reportData.spendingByCategory.forEach((category) => {
      doc
        .fontSize(12)
        .text(
          `${category._id} (${category.type}): ${category.totalSpent.toFixed(
            2
          )}`,
          50,
          yPosition
        )
        .text(`Items: ${category.itemCount}`, 300, yPosition);
      yPosition += 20;
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
    });
  } catch (error) {
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};

// Generate Excel report
const generateExcelReport = async (reportData) => {
  try {
    const workbook = new ExcelJS.Workbook();
    // Summary worksheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.addRow(["Fashion Spending Report"]);
    summarySheet.addRow(["Generated on:", new Date().toLocaleDateString()]);
    summarySheet.addRow([
      "Period:",
      `${reportData.dateRange.startDate.toLocaleDateString()} - 
${reportData.dateRange.endDate.toLocaleDateString()}`,
    ]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Total Spent:", reportData.totalSpent]);
    summarySheet.addRow(["Budget Amount:", reportData.budgetAmount]);
    summarySheet.addRow(["Budget Remaining:", reportData.budgetRemaining]);
    summarySheet.addRow(["Total Items:", reportData.totalItems]);
    // Category breakdown worksheet
    const categorySheet = workbook.addWorksheet("Category Breakdown");
    categorySheet.addRow(["Category", "Type", "Total Spent", "Item Count"]);
    reportData.spendingByCategory.forEach((category) => {
      categorySheet.addRow([
        category._id,
        category.type,
        category.totalSpent,
        category.itemCount,
      ]);
    });
    // Style the worksheets
    summarySheet.getCell("A1").font = { bold: true, size: 16 };
    categorySheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(`Failed to generate Excel report: ${error.message}`);
  }
};
module.exports = {
  generateSpendingReport,
  generateBudgetAnalysisReport,
  generateOutfitUsageReport,
  generateSustainabilityReport,
  generatePDFReport,
  generateExcelReport,
};

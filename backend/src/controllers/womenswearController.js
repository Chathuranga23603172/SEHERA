const { validationResult } = require('express-validator'); 
const Womenswear = require('../models/Womenswear'); 
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/imageUpload'); 
// @desc    Get all womenswear items for user 
// @route   GET /api/womenswear 
// @access  Private 
const getWomenswearItems = async (req, res) => { 
  try { 
    const { page = 1, limit = 10, category, brand, season, purpose, minPrice, maxPrice, search 
} = req.query; 
    const userId = req.user.userId; 
 
    // Build filter query 
    let filter = { user: userId }; 
 
    if (category) filter.category = category; 
    if (brand) filter.brand = new RegExp(brand, 'i'); 
    if (season) filter.season = season; 
    if (purpose) filter.purpose = purpose; 
    if (minPrice || maxPrice) { 
      filter.price = {}; 
      if (minPrice) filter.price.$gte = Number(minPrice); 
      if (maxPrice) filter.price.$lte = Number(maxPrice); 
    } 
    if (search) { 
      filter.$or = [ 
        { name: new RegExp(search, 'i') }, 
        { description: new RegExp(search, 'i') }, 
        { brand: new RegExp(search, 'i') } 
      ]; 
    } 
 
    const skip = (page - 1) * limit; 
 
    const items = await Womenswear.find(filter) 
      .sort({ createdAt: -1 }) 
      .skip(skip) 
      .limit(Number(limit)) 
      .populate('user', 'name email'); 
 
    const total = await Womenswear.countDocuments(filter); 
 
    res.status(200).json({ 
      success: true, 
      data: items, 
      pagination: { 
        page: Number(page), 
        limit: Number(limit), 
        total, 
        pages: Math.ceil(total / limit) 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get womenswear items error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
}); 
} 
}; 
// @desc    Get single womenswear item 
// @route   GET /api/womenswear/:id 
// @access  Private 
const getWomenswearItem = async (req, res) => { 
try { 
const itemId = req.params.id; 
const userId = req.user.userId; 
const item = await Womenswear.findOne({ _id: itemId, user: userId }); 
if (!item) { 
return res.status(404).json({ 
success: false, 
message: 'Womenswear item not found' 
}); 
} 
res.status(200).json({ 
success: true, 
data: item 
}); 
  } catch (error) { 
    console.error('Get womenswear item error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Create womenswear item 
// @route   POST /api/womenswear 
// @access  Private 
const createWomenswearItem = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const userId = req.user.userId; 
    const { 
      name, 
      description, 
      category, 
      brand, 
      price, 
      size, 
      color, 
      season, 
      purpose, 
      purchaseDate, 
      discountPercentage 
    } = req.body; 
 
    let imageUrls = []; 
 
    // Handle image uploads if present 
    if (req.files && req.files.length > 0) { 
      const uploadPromises = req.files.map(file =>  
        uploadToCloudinary(file.buffer, 'womenswear') 
      ); 
      const uploadResults = await Promise.all(uploadPromises); 
      imageUrls = uploadResults.map(result => ({ 
        url: result.secure_url, 
        publicId: result.public_id 
      })); 
    } 
 
    // Calculate discounted price 
    let finalPrice = price; 
    if (discountPercentage && discountPercentage > 0) { 
      finalPrice = price - (price * (discountPercentage / 100)); 
    } 
 
    const womenswearItem = new Womenswear({ 
      user: userId, 
      name, 
      description, 
      category, 
      brand, 
      price, 
      discountPercentage, 
      finalPrice, 
      size, 
      color, 
      season, 
      purpose, 
      purchaseDate, 
      images: imageUrls 
    }); 
 
    await womenswearItem.save(); 
 
    res.status(201).json({ 
      success: true, 
      message: 'Womenswear item created successfully', 
      data: womenswearItem 
    }); 
 
  } catch (error) { 
    console.error('Create womenswear item error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Update womenswear item 
// @route   PUT /api/womenswear/:id 
// @access  Private 
const updateWomenswearItem = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const itemId = req.params.id; 
    const userId = req.user.userId; 
 
    const item = await Womenswear.findOne({ _id: itemId, user: userId }); 
 
    if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Womenswear item not found' 
      }); 
    } 
 
    const updateData = { ...req.body }; 
 
    // Handle image updates if new files are uploaded 
    if (req.files && req.files.length > 0) { 
      // Delete old images from cloudinary 
      if (item.images && item.images.length > 0) { 
        const deletePromises = item.images.map(img =>  
          deleteFromCloudinary(img.publicId) 
        ); 
        await Promise.all(deletePromises); 
      } 
 
      // Upload new images 
      const uploadPromises = req.files.map(file =>  
        uploadToCloudinary(file.buffer, 'womenswear') 
      ); 
      const uploadResults = await Promise.all(uploadPromises); 
      updateData.images = uploadResults.map(result => ({ 
        url: result.secure_url, 
        publicId: result.public_id 
      })); 
    } 
 
    // Recalculate final price if price or discount changed 
    if (updateData.price || updateData.discountPercentage) { 
      const price = updateData.price || item.price; 
      const discount = updateData.discountPercentage || item.discountPercentage || 0; 
      updateData.finalPrice = price - (price * (discount / 100)); 
    } 
 
    updateData.updatedAt = new Date(); 
 
    const updatedItem = await Womenswear.findByIdAndUpdate( 
      itemId, 
      updateData, 
      { new: true, runValidators: true } 
    ); 
 
res.status(200).json({ 
success: true, 
message: 'Womenswear item updated successfully', 
data: updatedItem 
}); 
} catch (error) { 
console.error('Update womenswear item error:', error); 
res.status(500).json({ 
success: false, 
message: 'Internal server error' 
}); 
} 
}; 
// @desc    Delete womenswear item 
// @route   DELETE /api/womenswear/:id 
// @access  Private 
const deleteWomenswearItem = async (req, res) => { 
try { 
const itemId = req.params.id; 
const userId = req.user.userId; 
const item = await Womenswear.findOne({ _id: itemId, user: userId }); 
if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Womenswear item not found' 
      }); 
    } 
 
    // Delete images from cloudinary 
    if (item.images && item.images.length > 0) { 
      const deletePromises = item.images.map(img =>  
        deleteFromCloudinary(img.publicId) 
      ); 
      await Promise.all(deletePromises); 
    } 
 
    await Womenswear.findByIdAndDelete(itemId); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Womenswear item deleted successfully' 
    }); 
 
  } catch (error) { 
    console.error('Delete womenswear item error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
}); 
} 
}; 
// @desc    Update usage frequency and analyze sustainability 
// @route   PATCH /api/womenswear/:id/use 
// @access  Private 
const updateUsageAndSustainability = async (req, res) => { 
try { 
const itemId = req.params.id; 
const userId = req.user.userId; 
const item = await Womenswear.findOne({ _id: itemId, user: userId }); 
if (!item) { 
return res.status(404).json({ 
success: false, 
message: 'Womenswear item not found' 
}); 
} 
item.usageCount += 1; 
item.lastWorn = new Date(); 
// Calculate cost per wear for sustainability analysis 
const costPerWear = item.finalPrice / item.usageCount; 
     
    // Determine sustainability rating based on usage frequency 
    let sustainabilityRating = 'Poor'; 
    if (item.usageCount >= 30) sustainabilityRating = 'Excellent'; 
    else if (item.usageCount >= 15) sustainabilityRating = 'Good'; 
    else if (item.usageCount >= 5) sustainabilityRating = 'Fair'; 
 
    await item.save(); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Usage updated successfully', 
      data: { 
        usageCount: item.usageCount, 
        lastWorn: item.lastWorn, 
        costPerWear: costPerWear.toFixed(2), 
        sustainabilityRating 
      } 
    }); 
 
  } catch (error) { 
    console.error('Update usage and sustainability error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get womenswear statistics and sustainability analysis 
// @route   GET /api/womenswear/stats 
// @access  Private 
const getWomenswearStats = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
 
    const stats = await Womenswear.aggregate([ 
      { $match: { user: userId } }, 
      { 
        $group: { 
          _id: null, 
          totalItems: { $sum: 1 }, 
          totalValue: { $sum: '$finalPrice' }, 
          averagePrice: { $avg: '$finalPrice' }, 
          totalUsage: { $sum: '$usageCount' }, 
          categories: { $addToSet: '$category' }, 
          brands: { $addToSet: '$brand' }, 
          purposes: { $addToSet: '$purpose' } 
        } 
      } 
    ]); 
 
    // Calculate overall cost per wear 
    const overallStats = stats[0] || { 
      totalItems: 0, 
      totalValue: 0, 
      averagePrice: 0, 
      totalUsage: 0, 
      categories: [], 
      brands: [], 
      purposes: [] 
    }; 
 
    const averageCostPerWear = overallStats.totalUsage > 0  
      ? overallStats.totalValue / overallStats.totalUsage  
      : 0; 
 
    // Get most and least used items 
    const mostUsed = await Womenswear.find({ user: userId }) 
      .sort({ usageCount: -1 }) 
      .limit(5) 
      .select('name usageCount lastWorn finalPrice'); 
 
    const leastUsed = await Womenswear.find({ user: userId }) 
      .sort({ usageCount: 1 }) 
      .limit(5) 
      .select('name usageCount lastWorn finalPrice'); 
 
    // Get sustainability insights 
    const sustainabilityData = await Womenswear.aggregate([ 
      { $match: { user: userId } }, 
      { 
        $addFields: { 
          costPerWear: { $divide: ['$finalPrice', { $max: ['$usageCount', 1] }] } 
        } 
      }, 
      { 
        $group: { 
          _id: null, 
          mostEfficientItems: { $push: { name: '$name', costPerWear: '$costPerWear', 
usageCount: '$usageCount' } } 
        } 
      } 
    ]); 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        overview: { 
          ...overallStats, 
          averageCostPerWear: averageCostPerWear.toFixed(2) 
        }, 
        mostUsed, 
        leastUsed, 
        sustainability: { 
          averageCostPerWear: averageCostPerWear.toFixed(2), 
          totalSavingsFromReuse: (overallStats.totalValue - (averageCostPerWear * 
overallStats.totalUsage)).toFixed(2) 
        } 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get womenswear stats error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
module.exports = { 
  getWomenswearItems, 
  getWomenswearItem, 
  createWomenswearItem, 
  updateWomenswearItem, 
  deleteWomenswearItem, 
  updateUsageAndSustainability, 
  getWomenswearStats 
};
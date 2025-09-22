const { validationResult } = require('express-validator'); 
const Kidswear = require('../models/Kidswear'); 
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/imageUpload'); 
// @desc    Get all kidswear items for user 
// @route   GET /api/kidswear 
// @access  Private 
const getKidswearItems = async (req, res) => { 
try { 
const { page = 1, limit = 10, category, brand, ageGroup, size, color, minPrice, maxPrice, 
search } = req.query; 
const userId = req.user.userId; 
// Build filter query 
let filter = { user: userId }; 
if (category) filter.category = category; 
if (brand) filter.brand = new RegExp(brand, 'i'); 
if (ageGroup) filter.ageGroup = ageGroup; 
if (size) filter.size = size; 
if (color) filter.color = new RegExp(color, 'i'); 
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
 
    const items = await Kidswear.find(filter) 
      .sort({ createdAt: -1 }) 
      .skip(skip) 
      .limit(Number(limit)) 
      .populate('user', 'name email'); 
 
    const total = await Kidswear.countDocuments(filter); 
 
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
    console.error('Get kidswear items error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get single kidswear item 
// @route   GET /api/kidswear/:id 
// @access  Private 
const getKidswearItem = async (req, res) => { 
  try { 
    const itemId = req.params.id; 
    const userId = req.user.userId; 
 
    const item = await Kidswear.findOne({ _id: itemId, user: userId }); 
 
    if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Kidswear item not found' 
      }); 
    } 
 
    res.status(200).json({ 
      success: true, 
      data: item 
    }); 
 
  } catch (error) { 
    console.error('Get kidswear item error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Create kidswear item 
// @route   POST /api/kidswear 
// @access  Private 
const createKidswearItem = async (req, res) => { 
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
      ageGroup, 
      durability, 
      purchaseDate, 
      discountPercentage, 
      growthNotes, 
      childName 
    } = req.body; 
 
    let imageUrls = []; 
 
    // Handle image uploads if present 
    if (req.files && req.files.length > 0) { 
      const uploadPromises = req.files.map(file =>  
        uploadToCloudinary(file.buffer, 'kidswear') 
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
 
    const kidswearItem = new Kidswear({ 
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
      ageGroup, 
      durability, 
      purchaseDate, 
      growthNotes, 
      childName, 
      images: imageUrls 
    }); 
 
    await kidswearItem.save(); 
 
    res.status(201).json({ 
      success: true, 
      message: 'Kidswear item created successfully', 
      data: kidswearItem 
    }); 
 
  } catch (error) { 
    console.error('Create kidswear item error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Update kidswear item 
// @route   PUT /api/kidswear/:id 
// @access  Private 
const updateKidswearItem = async (req, res) => { 
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
 
    const item = await Kidswear.findOne({ _id: itemId, user: userId }); 
 
    if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Kidswear item not found' 
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
        uploadToCloudinary(file.buffer, 'kidswear') 
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
 
    const updatedItem = await Kidswear.findByIdAndUpdate( 
      itemId, 
      updateData, 
      { new: true, runValidators: true } 
    ); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Kidswear item updated successfully', 
      data: updatedItem 
    }); 
 
  } catch (error) { 
    console.error('Update kidswear item error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Delete kidswear item 
// @route   DELETE /api/kidswear/:id 
// @access  Private 
const deleteKidswearItem = async (req, res) => { 
  try { 
    const itemId = req.params.id; 
    const userId = req.user.userId; 
 
    const item = await Kidswear.findOne({ _id: itemId, user: userId }); 
 
    if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Kidswear item not found' 
      }); 
    } 
 
    // Delete images from cloudinary 
    if (item.images && item.images.length > 0) { 
      const deletePromises = item.images.map(img =>  
        deleteFromCloudinary(img.publicId) 
      ); 
      await Promise.all(deletePromises); 
    } 
 
    await Kidswear.findByIdAndDelete(itemId); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Kidswear item deleted successfully' 
    }); 
 
  } catch (error) { 
    console.error('Delete kidswear item error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Add item to cart 
// @route   POST /api/kidswear/:id/cart 
// @access  Private 
const addToCart = async (req, res) => { 
  try { 
    const itemId = req.params.id; 
    const userId = req.user.userId; 
    const { quantity = 1 } = req.body; 
 
    const item = await Kidswear.findOne({ _id: itemId, user: userId }); 
 
    if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Kidswear item not found' 
      }); 
    } 
 
    // Add to cart (assuming cart is managed separately or in user model) 
    // For now, we'll just track this action 
    item.cartAddedCount = (item.cartAddedCount || 0) + 1; 
    await item.save(); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Item added to cart successfully', 
      data: { 
        itemId: item._id, 
        name: item.name, 
        price: item.finalPrice, 
        quantity 
      } 
    }); 
 
  } catch (error) { 
    console.error('Add to cart error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Update size usage and check for upgrade alerts 
// @route   PATCH /api/kidswear/:id/size-check 
// @access  Private 
const updateSizeAndCheckUpgrade = async (req, res) => { 
  try { 
    const itemId = req.params.id; 
    const userId = req.user.userId; 
    const { currentFit, childAge, childHeight, childWeight } = req.body; 
 
    const item = await Kidswear.findOne({ _id: itemId, user: userId }); 
 
    if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Kidswear item not found' 
      }); 
    } 
 
    // Update size tracking information 
    item.sizeTracking = { 
      currentFit, 
      childAge, 
      childHeight, 
      childWeight, 
      lastChecked: new Date() 
    }; 
 
    // Determine if size upgrade is needed based on fit 
    let upgradeAlert = false; 
    let upgradeMessage = ''; 
 
    if (currentFit === 'too-small') { 
      upgradeAlert = true; 
      upgradeMessage = `${item.name} appears to be too small. Consider purchasing a larger 
size.`; 
    } else if (currentFit === 'tight') { 
      upgradeAlert = true; 
      upgradeMessage = `${item.name} is getting tight. You may need to size up soon.`; 
    } 
 
    if (upgradeAlert) { 
      item.upgradeAlert = { 
        active: true, 
        message: upgradeMessage, 
        dateCreated: new Date() 
      }; 
    } 
 
    await item.save(); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Size tracking updated successfully', 
      data: { 
        sizeTracking: item.sizeTracking, 
        upgradeAlert: item.upgradeAlert 
      } 
    }); 
 
  } catch (error) { 
    console.error('Update size and check upgrade error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get growth stage analysis 
// @route   GET /api/kidswear/growth-analysis 
// @access  Private 
const getGrowthAnalysis = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
    const { childName } = req.query; 
 
    let filter = { user: userId }; 
    if (childName) filter.childName = childName; 
 
    const items = await Kidswear.find(filter).sort({ purchaseDate: 1 }); 
 
    // Group by age groups 
    const growthAnalysis = { 
      '0-36months': [], 
      '2-12years': [], 
      '13-16years': [] 
    }; 
 
    const sizeUpgradeAlerts = []; 
 
    items.forEach(item => { 
      growthAnalysis[item.ageGroup].push({ 
        name: item.name, 
        size: item.size, 
        purchaseDate: item.purchaseDate, 
        durability: item.durability, 
        finalPrice: item.finalPrice, 
        notes: item.growthNotes 
      }); 
 
      if (item.upgradeAlert && item.upgradeAlert.active) { 
        sizeUpgradeAlerts.push({ 
          itemId: item._id, 
          name: item.name, 
          message: item.upgradeAlert.message, 
          dateCreated: item.upgradeAlert.dateCreated 
        }); 
      } 
    }); 
 
    // Calculate spending by age group 
    const spendingByAgeGroup = {}; 
    Object.keys(growthAnalysis).forEach(ageGroup => { 
      spendingByAgeGroup[ageGroup] = growthAnalysis[ageGroup] 
        .reduce((total, item) => total + item.finalPrice, 0); 
    }); 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        growthAnalysis, 
        spendingByAgeGroup, 
        sizeUpgradeAlerts, 
        totalItems: items.length, 
        totalSpending: Object.values(spendingByAgeGroup).reduce((sum, val) => sum + val, 0) 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get growth analysis error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get kidswear statistics 
// @route   GET /api/kidswear/stats 
// @access  Private 
const getKidswearStats = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
 
    const stats = await Kidswear.aggregate([ 
      { $match: { user: userId } }, 
      { 
        $group: { 
          _id: null, 
          totalItems: { $sum: 1 }, 
          totalValue: { $sum: '$finalPrice' }, 
          averagePrice: { $avg: '$finalPrice' }, 
          ageGroups: { $addToSet: '$ageGroup' }, 
          brands: { $addToSet: '$brand' }, 
          sizes: { $addToSet: '$size' } 
        } 
      } 
    ]); 
 
    // Get items by age group 
    const itemsByAgeGroup = await Kidswear.aggregate([ 
      { $match: { user: userId } }, 
      { 
        $group: { 
          _id: '$ageGroup', 
          count: { $sum: 1 }, 
          totalValue: { $sum: '$finalPrice' } 
        } 
      } 
    ]); 
 
    // Get active upgrade alerts 
    const activeAlerts = await Kidswear.find({ 
      user: userId, 
      'upgradeAlert.active': true 
    }).select('name upgradeAlert.message upgradeAlert.dateCreated'); 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        overview: stats[0] || { 
          totalItems: 0, 
          totalValue: 0, 
          averagePrice: 0, 
          ageGroups: [], 
          brands: [], 
          sizes: [] 
        }, 
        itemsByAgeGroup, 
        activeUpgradeAlerts: activeAlerts.length, 
        upgradeAlerts: activeAlerts 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get kidswear stats error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
module.exports = { 
  getKidswearItems, 
  getKidswearItem, 
  createKidswearItem, 
  updateKidswearItem, 
  deleteKidswearItem, 
addToCart, 
updateSizeAndCheckUpgrade, 
getGrowthAnalysis, 
getKidswearStats 
};
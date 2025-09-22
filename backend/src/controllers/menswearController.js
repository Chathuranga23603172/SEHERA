const { validationResult } = require('express-validator'); 
const Menswear = require('../models/Menswear'); 
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/imageUpload'); 
// @desc    Get all menswear items for user 
// @route   GET /api/menswear 
// @access  Private 
const getMenswearItems = async (req, res) => { 
try { 
const { page = 1, limit = 10, category, brand, season, occasion, minPrice, maxPrice, 
search } = req.query; 
const userId = req.user.userId; 
// Build filter query 
let filter = { user: userId }; 
if (category) filter.category = category; 
if (brand) filter.brand = new RegExp(brand, 'i'); 
if (season) filter.season = season; 
if (occasion) filter.occasion = occasion; 
if (minPrice || maxPrice) { 
f
 ilter.price = {}; 
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
 
    const items = await Menswear.find(filter) 
      .sort({ createdAt: -1 }) 
      .skip(skip) 
      .limit(Number(limit)) 
      .populate('user', 'name email'); 
 
    const total = await Menswear.countDocuments(filter); 
 
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
console.error('Get menswear items error:', error); 
res.status(500).json({ 
success: false, 
message: 'Internal server error' 
}); 
} 
}; 
// @desc    Get single menswear item 
// @route   GET /api/menswear/:id 
// @access  Private 
const getMenswearItem = async (req, res) => { 
try { 
const itemId = req.params.id; 
const userId = req.user.userId; 
const item = await Menswear.findOne({ _id: itemId, user: userId }); 
if (!item) { 
return res.status(404).json({ 
success: false, 
message: 'Menswear item not found' 
}); 
} 
res.status(200).json({ 
success: true, 
data: item 
}); 
} catch (error) { 
console.error('Get menswear item error:', error); 
res.status(500).json({ 
success: false, 
message: 'Internal server error' 
}); 
} 
}; 
// @desc    Create menswear item 
// @route   POST /api/menswear 
// @access  Private 
const createMenswearItem = async (req, res) => { 
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
      occasion, 
      purchaseDate, 
      discountPercentage 
    } = req.body; 
 
    let imageUrls = []; 
 
    // Handle image uploads if present 
    if (req.files && req.files.length > 0) { 
      const uploadPromises = req.files.map(file =>  
        uploadToCloudinary(file.buffer, 'menswear') 
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
 
    const menswearItem = new Menswear({ 
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
occasion, 
purchaseDate, 
images: imageUrls 
}); 
await menswearItem.save(); 
res.status(201).json({ 
success: true, 
message: 'Menswear item created successfully', 
data: menswearItem 
}); 
} catch (error) { 
console.error('Create menswear item error:', error); 
res.status(500).json({ 
success: false, 
message: 'Internal server error' 
}); 
} 
}; 
// @desc    Update menswear item 
// @route   PUT /api/menswear/:id 
// @access  Private 
const updateMenswearItem = async (req, res) => { 
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
 
    const item = await Menswear.findOne({ _id: itemId, user: userId }); 
 
    if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Menswear item not found' 
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
        uploadToCloudinary(file.buffer, 'menswear') 
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
const updatedItem = await Menswear.findByIdAndUpdate( 
itemId, 
updateData, 
{ new: true, runValidators: true } 
); 
res.status(200).json({ 
success: true, 
message: 'Menswear item updated successfully', 
data: updatedItem 
}); 
} catch (error) { 
console.error('Update menswear item error:', error); 
res.status(500).json({ 
success: false, 
message: 'Internal server error' 
}); 
} 
}; 
// @desc    Delete menswear item 
// @route   DELETE /api/menswear/:id 
// @access  Private 
const deleteMenswearItem = async (req, res) => { 
  try { 
    const itemId = req.params.id; 
    const userId = req.user.userId; 
 
    const item = await Menswear.findOne({ _id: itemId, user: userId }); 
 
    if (!item) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Menswear item not found' 
      }); 
    } 
 
    // Delete images from cloudinary 
    if (item.images && item.images.length > 0) { 
      const deletePromises = item.images.map(img =>  
        deleteFromCloudinary(img.publicId) 
      ); 
      await Promise.all(deletePromises); 
    } 
 
    await Menswear.findByIdAndDelete(itemId); 
 
    res.status(200).json({ 
      success: true, 
message: 'Menswear item deleted successfully' 
}); 
} catch (error) { 
console.error('Delete menswear item error:', error); 
res.status(500).json({ 
success: false, 
message: 'Internal server error' 
}); 
} 
}; 
// @desc    Update usage frequency 
// @route   PATCH /api/menswear/:id/use 
// @access  Private 
const updateUsageFrequency = async (req, res) => { 
try { 
const itemId = req.params.id; 
const userId = req.user.userId; 
const item = await Menswear.findOne({ _id: itemId, user: userId }); 
if (!item) { 
return res.status(404).json({ 
success: false, 
message: 'Menswear item not found' 
      }); 
    } 
 
    item.usageCount += 1; 
    item.lastWorn = new Date(); 
    await item.save(); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Usage updated successfully', 
      data: { 
        usageCount: item.usageCount, 
        lastWorn: item.lastWorn 
      } 
    }); 
 
  } catch (error) { 
    console.error('Update usage frequency error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get menswear statistics 
// @route   GET /api/menswear/stats 
// @access  Private 
const getMenswearStats = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
 
    const stats = await Menswear.aggregate([ 
      { $match: { user: userId } }, 
      { 
        $group: { 
          _id: null, 
          totalItems: { $sum: 1 }, 
          totalValue: { $sum: '$finalPrice' }, 
          averagePrice: { $avg: '$finalPrice' }, 
          mostUsedItem: { $max: '$usageCount' }, 
          categories: { $addToSet: '$category' }, 
          brands: { $addToSet: '$brand' } 
        } 
      } 
    ]); 
 
    // Get most and least used items 
    const mostUsed = await Menswear.find({ user: userId }) 
      .sort({ usageCount: -1 }) 
      .limit(5) 
      .select('name usageCount lastWorn'); 
 
    const leastUsed = await Menswear.find({ user: userId }) 
      .sort({ usageCount: 1 }) 
      .limit(5) 
      .select('name usageCount lastWorn'); 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        overview: stats[0] || { 
          totalItems: 0, 
          totalValue: 0, 
          averagePrice: 0, 
          mostUsedItem: 0, 
          categories: [], 
          brands: [] 
        }, 
        mostUsed, 
        leastUsed 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get menswear stats error:', error); 
    res.status(500).json({ 
      success: false, 
message: 'Internal server error' 
}); 
} 
}; 
module.exports = { 
getMenswearItems, 
getMenswearItem, 
createMenswearItem, 
updateMenswearItem, 
deleteMenswearItem, 
updateUsageFrequency, 
getMenswearStats 
};
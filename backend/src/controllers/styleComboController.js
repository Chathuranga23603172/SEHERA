const { validationResult } = require('express-validator'); 
const StyleCombo = require('../models/StyleCombo'); 
const Menswear = require('../models/Menswear'); 
const Womenswear = require('../models/Womenswear'); 
const Kidswear = require('../models/Kidswear'); 
// @desc    Get all style combos for user 
// @route   GET /api/style-combo 
// @access  Private 
const getStyleCombos = async (req, res) => { 
try { 
const { page = 1, limit = 10, event, styleName, search } = req.query; 
const userId = req.user.userId; 
// Build filter query 
let filter = { user: userId }; 
if (event) filter.eventTag = event; 
if (styleName) filter.styleName = new RegExp(styleName, 'i'); 
if (search) { 
f
 ilter.$or = [ 
{ name: new RegExp(search, 'i') }, 
{ description: new RegExp(search, 'i') }, 
{ eventTag: new RegExp(search, 'i') }, 
{ styleName: new RegExp(search, 'i') } 
]; 
    } 
 
    const skip = (page - 1) * limit; 
 
    const combos = await StyleCombo.find(filter) 
      .sort({ createdAt: -1 }) 
      .skip(skip) 
      .limit(Number(limit)) 
      .populate('items.menswear', 'name brand price images') 
      .populate('items.womenswear', 'name brand price images') 
      .populate('items.kidswear', 'name brand price images'); 
 
    const total = await StyleCombo.countDocuments(filter); 
 
    res.status(200).json({ 
      success: true, 
      data: combos, 
      pagination: { 
        page: Number(page), 
        limit: Number(limit), 
        total, 
        pages: Math.ceil(total / limit) 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get style combos error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get single style combo 
// @route   GET /api/style-combo/:id 
// @access  Private 
const getStyleCombo = async (req, res) => { 
  try { 
    const comboId = req.params.id; 
    const userId = req.user.userId; 
 
    const combo = await StyleCombo.findOne({ _id: comboId, user: userId }) 
      .populate('items.menswear', 'name brand price images category') 
      .populate('items.womenswear', 'name brand price images category') 
      .populate('items.kidswear', 'name brand price images category'); 
 
    if (!combo) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Style combo not found' 
      }); 
    } 
 
    res.status(200).json({ 
      success: true, 
      data: combo 
    }); 
 
  } catch (error) { 
    console.error('Get style combo error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Create style combo 
// @route   POST /api/style-combo 
// @access  Private 
const createStyleCombo = async (req, res) => { 
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
      eventTag, 
      styleName, 
      items 
    } = req.body; 
 
    // Validate that all items belong to the user 
    const menswearIds = items.menswear || []; 
    const womenswearIds = items.womenswear || []; 
    const kidswearIds = items.kidswear || []; 
 
    // Check menswear items 
    if (menswearIds.length > 0) { 
      const menswearCount = await Menswear.countDocuments({ 
        _id: { $in: menswearIds }, 
        user: userId 
      }); 
      if (menswearCount !== menswearIds.length) { 
        return res.status(400).json({ 
          success: false, 
          message: 'Some menswear items not found or do not belong to user' 
        }); 
      } 
    } 
 
    // Check womenswear items 
    if (womenswearIds.length > 0) { 
      const womenswearCount = await Womenswear.countDocuments({ 
        _id: { $in: womenswearIds }, 
        user: userId 
      }); 
      if (womenswearCount !== womenswearIds.length) { 
        return res.status(400).json({ 
          success: false, 
          message: 'Some womenswear items not found or do not belong to user' 
        }); 
      } 
    } 
 
    // Check kidswear items 
    if (kidswearIds.length > 0) { 
      const kidswearCount = await Kidswear.countDocuments({ 
        _id: { $in: kidswearIds }, 
        user: userId 
      }); 
      if (kidswearCount !== kidswearIds.length) { 
        return res.status(400).json({ 
          success: false, 
          message: 'Some kidswear items not found or do not belong to user' 
        }); 
      } 
    } 
 
    // Calculate total price 
    const menswearItems = await Menswear.find({ _id: { $in: menswearIds } 
}).select('finalPrice'); 
    const womenswearItems = await Womenswear.find({ _id: { $in: womenswearIds } 
}).select('finalPrice'); 
    const kidswearItems = await Kidswear.find({ _id: { $in: kidswearIds } }).select('finalPrice'); 
 
    const totalPrice = [ 
      ...menswearItems, 
      ...womenswearItems, 
      ...kidswearItems 
    ].reduce((sum, item) => sum + item.finalPrice, 0); 
 
    const styleCombo = new StyleCombo({ 
      user: userId, 
      name, 
      description, 
      eventTag, 
      styleName, 
      items, 
      totalPrice 
    }); 
 
    await styleCombo.save(); 
 
    // Populate the created combo 
    await styleCombo.populate([ 
      { path: 'items.menswear', select: 'name brand price images' }, 
      { path: 'items.womenswear', select: 'name brand price images' }, 
      { path: 'items.kidswear', select: 'name brand price images' } 
    ]); 
 
    res.status(201).json({ 
      success: true, 
      message: 'Style combo created successfully', 
      data: styleCombo 
    }); 
 
  } catch (error) { 
    console.error('Create style combo error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Update style combo 
// @route   PUT /api/style-combo/:id 
// @access  Private 
const updateStyleCombo = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const comboId = req.params.id; 
    const userId = req.user.userId; 
 
    const combo = await StyleCombo.findOne({ _id: comboId, user: userId }); 
 
    if (!combo) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Style combo not found' 
      }); 
    } 
 
    const updateData = { ...req.body }; 
 
    // If items are being updated, validate and recalculate total price 
    if (updateData.items) { 
      const { menswear = [], womenswear = [], kidswear = [] } = updateData.items; 
 
      // Validate items belong to user (similar to create function) 
      if (menswear.length > 0) { 
        const count = await Menswear.countDocuments({ _id: { $in: menswear }, user: userId }); 
        if (count !== menswear.length) { 
          return res.status(400).json({ 
            success: false, 
            message: 'Some menswear items not found or do not belong to user' 
          }); 
        } 
      } 
 
      if (womenswear.length > 0) { 
        const count = await Womenswear.countDocuments({ _id: { $in: womenswear }, user: 
userId }); 
        if (count !== womenswear.length) { 
          return res.status(400).json({ 
            success: false, 
            message: 'Some womenswear items not found or do not belong to user' 
          }); 
        } 
      } 
 
      if (kidswear.length > 0) { 
        const count = await Kidswear.countDocuments({ _id: { $in: kidswear }, user: userId }); 
        if (count !== kidswear.length) { 
          return res.status(400).json({ 
            success: false, 
            message: 'Some kidswear items not found or do not belong to user' 
          }); 
        } 
      } 
 
      // Recalculate total price 
      const menswearItems = await Menswear.find({ _id: { $in: menswear } 
}).select('finalPrice'); 
      const womenswearItems = await Womenswear.find({ _id: { $in: womenswear } 
}).select('finalPrice'); 
      const kidswearItems = await Kidswear.find({ _id: { $in: kidswear } }).select('finalPrice'); 
 
      updateData.totalPrice = [ 
        ...menswearItems, 
        ...womenswearItems, 
        ...kidswearItems 
      ].reduce((sum, item) => sum + item.finalPrice, 0); 
    } 
 
    updateData.updatedAt = new Date(); 
 
    const updatedCombo = await StyleCombo.findByIdAndUpdate( 
      comboId, 
      updateData, 
      { new: true, runValidators: true } 
    ).populate([ 
      { path: 'items.menswear', select: 'name brand price images' }, 
      { path: 'items.womenswear', select: 'name brand price images' }, 
      { path: 'items.kidswear', select: 'name brand price images' } 
    ]); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Style combo updated successfully', 
      data: updatedCombo 
    }); 
 
  } catch (error) { 
    console.error('Update style combo error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Delete style combo 
// @route   DELETE /api/style-combo/:id 
// @access  Private 
const deleteStyleCombo = async (req, res) => { 
  try { 
    const comboId = req.params.id; 
    const userId = req.user.userId; 
 
    const combo = await StyleCombo.findOne({ _id: comboId, user: userId }); 
 
    if (!combo) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Style combo not found' 
      }); 
    } 
 
    await StyleCombo.findByIdAndDelete(comboId); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Style combo deleted successfully' 
    }); 
 
  } catch (error) { 
    console.error('Delete style combo error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Update outfit usage frequency 
// @route   PATCH /api/style-combo/:id/use 
// @access  Private 
const updateOutfitUsage = async (req, res) => { 
  try { 
    const comboId = req.params.id; 
    const userId = req.user.userId; 
 
    const combo = await StyleCombo.findOne({ _id: comboId, user: userId }); 
 
    if (!combo) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Style combo not found' 
      }); 
    } 
 
    combo.usageCount += 1; 
    combo.lastWorn = new Date(); 
    await combo.save(); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Outfit usage updated successfully', 
      data: { 
        usageCount: combo.usageCount, 
        lastWorn: combo.lastWorn 
      } 
    }); 
 
  } catch (error) { 
    console.error('Update outfit usage error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Compare multiple outfits side-by-side 
// @route   POST /api/style-combo/compare 
// @access  Private 
const compareOutfits = async (req, res) => { 
  try { 
    const { outfitIds } = req.body; 
    const userId = req.user.userId; 
 
    if (!outfitIds || outfitIds.length < 2 || outfitIds.length > 3) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide 2-3 outfit IDs for comparison' 
      }); 
    } 
 
    const outfits = await StyleCombo.find({ 
      _id: { $in: outfitIds }, 
      user: userId 
    }).populate([ 
      { path: 'items.menswear', select: 'name brand finalPrice color images category' }, 
      { path: 'items.womenswear', select: 'name brand finalPrice color images category' }, 
      { path: 'items.kidswear', select: 'name brand finalPrice color images category' } 
    ]); 
 
    if (outfits.length !== outfitIds.length) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Some outfits not found' 
      }); 
    } 
 
    // Create comparison data 
    const comparison = outfits.map(outfit => ({ 
      id: outfit._id, 
      name: outfit.name, 
      totalPrice: outfit.totalPrice, 
      usageCount: outfit.usageCount, 
      lastWorn: outfit.lastWorn, 
      eventTag: outfit.eventTag, 
      styleName: outfit.styleName, 
      items: outfit.items, 
      costPerWear: outfit.usageCount > 0 ? (outfit.totalPrice / outfit.usageCount).toFixed(2) : 
outfit.totalPrice.toFixed(2) 
    })); 
 
    // Add comparison insights 
    const insights = { 
      mostExpensive: comparison.reduce((max, outfit) =>  
        outfit.totalPrice > max.totalPrice ? outfit : max 
      ), 
      mostUsed: comparison.reduce((max, outfit) =>  
        outfit.usageCount > max.usageCount ? outfit : max 
      ), 
      bestValue: comparison.reduce((best, outfit) =>  
        parseFloat(outfit.costPerWear) < parseFloat(best.costPerWear) ? outfit : best 
      ) 
    }; 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        outfits: comparison, 
        insights 
      } 
    }); 
 
  } catch (error) { 
    console.error('Compare outfits error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Share style combo 
// @route   POST /api/style-combo/:id/share 
// @access  Private 
const shareStyleCombo = async (req, res) => { 
  try { 
    const comboId = req.params.id; 
    const userId = req.user.userId; 
    const { shareMethod, recipient } = req.body; 
 
    const combo = await StyleCombo.findOne({ _id: comboId, user: userId }) 
      .populate([ 
        { path: 'items.menswear', select: 'name brand images' }, 
        { path: 'items.womenswear', select: 'name brand images' }, 
        { path: 'items.kidswear', select: 'name brand images' } 
      ]); 
 
    if (!combo) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Style combo not found' 
      }); 
    } 
 
    // Generate shareable link or data 
    const shareableData = { 
      name: combo.name, 
      description: combo.description, 
      eventTag: combo.eventTag, 
      styleName: combo.styleName, 
      totalPrice: combo.totalPrice, 
      items: combo.items, 
      sharedAt: new Date(), 
      sharedBy: userId 
    }; 
 
    // Update share count 
    combo.shareCount = (combo.shareCount || 0) + 1; 
    combo.lastShared = new Date(); 
    await combo.save(); 
 
    // Here you would implement actual sharing logic based on shareMethod 
    // (email, social media, etc.) 
 
    res.status(200).json({ 
      success: true, 
      message: 'Style combo shared successfully', 
      data: { 
        shareableData, 
        shareCount: combo.shareCount 
      } 
    }); 
 
  } catch (error) { 
    console.error('Share style combo error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get style combo statistics 
// @route   GET /api/style-combo/stats 
// @access  Private 
const getStyleComboStats = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
 
    const stats = await StyleCombo.aggregate([ 
      { $match: { user: userId } }, 
      { 
        $group: { 
          _id: null, 
          totalCombos: { $sum: 1 }, 
          totalValue: { $sum: '$totalPrice' }, 
          averagePrice: { $avg: '$totalPrice' }, 
          totalUsage: { $sum: '$usageCount' }, 
          events: { $addToSet: '$eventTag' }, 
          styles: { $addToSet: '$styleName' } 
        } 
      } 
    ]); 
 
    // Get most and least used combos 
    const mostUsed = await StyleCombo.find({ user: userId }) 
      .sort({ usageCount: -1 }) 
      .limit(5) 
      .select('name usageCount lastWorn totalPrice eventTag'); 
 
    const leastUsed = await StyleCombo.find({ user: userId }) 
      .sort({ usageCount: 1 }) 
      .limit(5) 
      .select('name usageCount lastWorn totalPrice eventTag'); 
 
    // Get combos by event 
    const combosByEvent = await StyleCombo.aggregate([ 
      { $match: { user: userId } }, 
      { 
        $group: { 
          _id: '$eventTag', 
          count: { $sum: 1 }, 
          totalValue: { $sum: '$totalPrice' }, 
          averageUsage: { $avg: '$usageCount' } 
        } 
      } 
    ]); 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        overview: stats[0] || { 
          totalCombos: 0, 
          totalValue: 0, 
          averagePrice: 0, 
          totalUsage: 0, 
          events: [], 
          styles: [] 
        }, 
        mostUsed, 
        leastUsed, 
        combosByEvent 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get style combo stats error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
module.exports = { 
getStyleCombos, 
getStyleCombo, 
createStyleCombo, 
updateStyleCombo, 
deleteStyleCombo, 
updateOutfitUsage, 
compareOutfits, 
shareStyleCombo, 
getStyleComboStats 
};
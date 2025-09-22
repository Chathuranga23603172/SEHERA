const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Menswear route is working'
  });
});

// Get all menswear items
router.get('/', (req, res) => {
  try {
    const menswearItems = [
      {
        id: 1,
        name: "Blue Shirt",
        brand: "H&M",
        category: "shirt",
        size: "M",
        color: "blue",
        price: 29.99,
        occasion: "casual",
        season: "summer"
      }
    ];

    res.json({
      success: true,
      count: menswearItems.length,
      data: menswearItems
    });
  } catch (error) {
    console.error('Error in GET menswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add new menswear item
router.post('/', (req, res) => {
  try {
    console.log('Received menswear data:', req.body);

    const { name, brand, category, size, color, price, occasion, season } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!brand) {
      return res.status(400).json({ success: false, message: 'Brand is required' });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    const newItem = {
      id: Date.now(),
      name,
      brand,
      category: category || 'general',
      size: size || 'M',
      color: color || 'default',
      price: parseFloat(price),
      occasion: occasion || 'casual',
      season: season || 'all',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Menswear item added successfully',
      data: { item: newItem }
    });

  } catch (error) {
    console.error('Error in POST menswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get single menswear item
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const item = {
      id,
      name: "Blue Shirt",
      brand: "H&M",
      category: "shirt",
      size: "M",
      color: "blue",
      price: 29.99,
      occasion: "casual",
      season: "summer"
    };

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error in GET single menswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update menswear item
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`Updating menswear item ${id} with:`, updateData);

    const updatedItem = {
      id,
      ...updateData,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Menswear item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error in PUT menswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete menswear item
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Deleting menswear item ${id}`);

    res.json({
      success: true,
      message: 'Menswear item deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE menswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(req.method + ' ' + req.path + ' - ' + new Date().toISOString());
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// SCHEMAS
// Menswear Schema
const menswearSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, default: 'general' },
  size: { type: String, default: 'M' },
  color: { type: String, default: 'default' },
  price: { type: Number, required: true, min: 0 },
  occasion: { type: String, default: 'casual' },
  season: { type: String, default: 'all' }
}, { timestamps: true });

const Menswear = mongoose.model('Menswear', menswearSchema);

// Womenswear Schema
const womenswearSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, default: 'general' },
  size: { type: String, default: 'S' },
  color: { type: String, default: 'default' },
  price: { type: Number, required: true, min: 0 },
  occasion: { type: String, default: 'casual' },
  season: { type: String, default: 'all' }
}, { timestamps: true });

const Womenswear = mongoose.model('Womenswear', womenswearSchema);

// Kidswear Schema
const kidswearSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, default: 'general' },
  size: { type: String, default: 'Age 5-6' },
  color: { type: String, default: 'default' },
  price: { type: Number, required: true, min: 0 },
  ageGroup: { type: String, default: 'kids' },
  durability: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { timestamps: true });

const Kidswear = mongoose.model('Kidswear', kidswearSchema);

// Style Combo Schema
const styleComboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  event: { type: String, default: 'casual' },
  items: [{
    itemId: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String }
  }],
  totalPrice: { type: Number, default: 0 }
}, { timestamps: true });

const StyleCombo = mongoose.model('StyleCombo', styleComboSchema);

// Budget Schema
const budgetSchema = new mongoose.Schema({
  annualBudget: { type: Number, required: true, min: 0 },
  categories: {
    menswear: { type: Number, default: 0 },
    womenswear: { type: Number, default: 0 },
    kidswear: { type: Number, default: 0 }
  },
  year: { type: Number, default: () => new Date().getFullYear() }
}, { timestamps: true });

const Budget = mongoose.model('Budget', budgetSchema);

// BASIC ROUTES
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fashion App API Server is running!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working correctly',
    version: '1.0.0'
  });
});

// MENSWEAR ROUTES
app.get('/api/menswear/test', (req, res) => {
  res.json({
    success: true,
    message: 'Menswear route is working'
  });
});

// GET ALL MENSWEAR
app.get('/api/menswear', async (req, res) => {
  try {
    const items = await Menswear.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: items.length,
      data: items
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

// ADD MENSWEAR
app.post('/api/menswear', async (req, res) => {
  try {
    console.log('Received menswear data:', req.body);
    
    const { name, brand, category, size, color, price, occasion, season } = req.body;
    
    if (!name || !brand || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, brand, and price are required'
      });
    }
    
    const newItem = new Menswear({
      name,
      brand,
      category,
      size,
      color,
      price: parseFloat(price),
      occasion,
      season
    });
    
    const savedItem = await newItem.save();
    
    res.status(201).json({
      success: true,
      message: 'Menswear item added successfully',
      data: {
        item: savedItem
      }
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

// UPDATE MENSWEAR
app.put('/api/menswear/:id', async (req, res) => {
  try {
    const updatedItem = await Menswear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
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

// DELETE MENSWEAR
app.delete('/api/menswear/:id', async (req, res) => {
  try {
    const deletedItem = await Menswear.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
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

// WOMENSWEAR ROUTES
app.get('/api/womenswear/test', (req, res) => {
  res.json({
    success: true,
    message: 'Womenswear route is working'
  });
});

// GET ALL WOMENSWEAR
app.get('/api/womenswear', async (req, res) => {
  try {
    const items = await Womenswear.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error in GET womenswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ADD WOMENSWEAR
app.post('/api/womenswear', async (req, res) => {
  try {
    const { name, brand, category, size, color, price, occasion, season } = req.body;
    
    if (!name || !brand || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, brand, and price are required'
      });
    }
    
    const newItem = new Womenswear({
      name,
      brand,
      category,
      size,
      color,
      price: parseFloat(price),
      occasion,
      season
    });
    
    const savedItem = await newItem.save();
    
    res.status(201).json({
      success: true,
      message: 'Womenswear item added successfully',
      data: { item: savedItem }
    });
    
  } catch (error) {
    console.error('Error in POST womenswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// KIDSWEAR ROUTES
app.get('/api/kidswear/test', (req, res) => {
  res.json({
    success: true,
    message: 'Kidswear route is working'
  });
});

// GET ALL KIDSWEAR
app.get('/api/kidswear', async (req, res) => {
  try {
    const items = await Kidswear.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error in GET kidswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ADD KIDSWEAR
app.post('/api/kidswear', async (req, res) => {
  try {
    const { name, brand, category, size, color, price, ageGroup, durability } = req.body;
    
    if (!name || !brand || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, brand, and price are required'
      });
    }
    
    const newItem = new Kidswear({
      name,
      brand,
      category,
      size,
      color,
      price: parseFloat(price),
      ageGroup,
      durability
    });
    
    const savedItem = await newItem.save();
    
    res.status(201).json({
      success: true,
      message: 'Kidswear item added successfully',
      data: { item: savedItem }
    });
    
  } catch (error) {
    console.error('Error in POST kidswear:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// STYLE COMBO ROUTES
app.get('/api/style-combo/test', (req, res) => {
  res.json({
    success: true,
    message: 'Style combo route is working'
  });
});

// GET ALL STYLE COMBOS
app.get('/api/style-combo', async (req, res) => {
  try {
    const combos = await StyleCombo.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: combos.length,
      data: combos
    });
  } catch (error) {
    console.error('Error in GET style combos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ADD STYLE COMBO
app.post('/api/style-combo', async (req, res) => {
  try {
    const { name, event, items, totalPrice } = req.body;
    
    if (!name || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Name and items array are required'
      });
    }
    
    const newCombo = new StyleCombo({
      name,
      event,
      items,
      totalPrice
    });
    
    const savedCombo = await newCombo.save();
    
    res.status(201).json({
      success: true,
      message: 'Style combo created successfully',
      data: { combo: savedCombo }
    });
    
  } catch (error) {
    console.error('Error in POST style combo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// BUDGET ROUTES
app.get('/api/budget/test', (req, res) => {
  res.json({
    success: true,
    message: 'Budget route is working'
  });
});

// GET ALL BUDGETS
app.get('/api/budget', async (req, res) => {
  try {
    const budgets = await Budget.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    console.error('Error in GET budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ADD BUDGET
app.post('/api/budget', async (req, res) => {
  try {
    const { annualBudget, categories, year } = req.body;
    
    if (!annualBudget || annualBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid annual budget is required'
      });
    }
    
    const newBudget = new Budget({
      annualBudget: parseFloat(annualBudget),
      categories,
      year
    });
    
    const savedBudget = await newBudget.save();
    
    res.status(201).json({
      success: true,
      message: 'Budget set successfully',
      data: { budget: savedBudget }
    });
    
  } catch (error) {
    console.error('Error in POST budget:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// OVERVIEW ROUTE - All data
app.get('/api/overview', async (req, res) => {
  try {
    const [menswear, womenswear, kidswear, styleCombos, budgets] = await Promise.all([
      Menswear.find().limit(5),
      Womenswear.find().limit(5),
      Kidswear.find().limit(5),
      StyleCombo.find().limit(5),
      Budget.find().limit(5)
    ]);
    
    res.json({
      success: true,
      message: 'Overview of all fashion data',
      data: {
        menswear: {
          count: menswear.length,
          items: menswear
        },
        womenswear: {
          count: womenswear.length,
          items: womenswear
        },
        kidswear: {
          count: kidswear.length,
          items: kidswear
        },
        styleCombos: {
          count: styleCombos.length,
          items: styleCombos
        },
        budgets: {
          count: budgets.length,
          items: budgets
        }
      }
    });
  } catch (error) {
    console.error('Error in GET overview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route ' + req.method + ' ' + req.originalUrl + ' not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Server URL: http://localhost:' + PORT);
  console.log('API Base URL: http://localhost:' + PORT + '/api');
  console.log('MongoDB connection: ' + (process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion-app'));
});
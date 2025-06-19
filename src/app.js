require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const shopItemRoutes = require('./routes/shopItemRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Import database seeding
const { seedDatabase } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/shop-items', shopItemRoutes);
app.use('/api/orders', orderRoutes);

// Seed endpoint (for development)
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed database', details: error.message });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Online Shop API',
    version: '1.0.0',
    endpoints: {
      customers: '/api/customers',
      categories: '/api/categories',
      shopItems: '/api/shop-items',
      orders: '/api/orders',
      seed: 'POST /api/seed',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}`);
});

module.exports = app;
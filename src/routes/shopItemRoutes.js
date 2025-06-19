import express from 'express';
import {
  getAllShopItems,
  getShopItemById,
  createShopItem,
  updateShopItem,
  deleteShopItem
} from '../controllers/shopItemController.js';

const router = express.Router();

// GET /api/shop-items - Get all shop items
router.get('/', getAllShopItems);

// GET /api/shop-items/:id - Get shop item by ID
router.get('/:id', getShopItemById);

// POST /api/shop-items - Create new shop item
router.post('/', createShopItem);

// PUT /api/shop-items/:id - Update shop item
router.put('/:id', updateShopItem);

// DELETE /api/shop-items/:id - Delete shop item
router.delete('/:id', deleteShopItem);

export default router; 
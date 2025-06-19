const express = require('express');
const router = express.Router();
const {
  getAllShopItems,
  getShopItemById,
  createShopItem,
  updateShopItem,
  deleteShopItem,
} = require('../controllers/shopItemController');

router.get('/', getAllShopItems);
router.get('/:id', getShopItemById);
router.post('/', createShopItem);
router.put('/:id', updateShopItem);
router.delete('/:id', deleteShopItem);

module.exports = router;
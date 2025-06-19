const { db } = require('../db');
const { shopItems, shopItemsToCategories, shopItemCategories } = require('../db/schema');
const { eq, inArray } = require('drizzle-orm');

// GET /api/shop-items
const getAllShopItems = async (req, res) => {
  try {
    const allItems = await db
      .select({
        id: shopItems.id,
        title: shopItems.title,
        description: shopItems.description,
        price: shopItems.price,
        createdAt: shopItems.createdAt,
        updatedAt: shopItems.updatedAt,
      })
      .from(shopItems);

    // Get categories for each item
    const itemsWithCategories = await Promise.all(
      allItems.map(async (item) => {
        const categories = await db
          .select({
            id: shopItemCategories.id,
            title: shopItemCategories.title,
            description: shopItemCategories.description,
          })
          .from(shopItemCategories)
          .innerJoin(shopItemsToCategories, eq(shopItemCategories.id, shopItemsToCategories.categoryId))
          .where(eq(shopItemsToCategories.shopItemId, item.id));
        
        return { ...item, categories };
      })
    );

    res.json(itemsWithCategories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop items', details: error.message });
  }
};

// GET /api/shop-items/:id
const getShopItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.select().from(shopItems).where(eq(shopItems.id, parseInt(id))).limit(1);
    
    if (item.length === 0) {
      return res.status(404).json({ error: 'Shop item not found' });
    }

    // Get categories for this item
    const categories = await db
      .select({
        id: shopItemCategories.id,
        title: shopItemCategories.title,
        description: shopItemCategories.description,
      })
      .from(shopItemCategories)
      .innerJoin(shopItemsToCategories, eq(shopItemCategories.id, shopItemsToCategories.categoryId))
      .where(eq(shopItemsToCategories.shopItemId, parseInt(id)));
    
    res.json({ ...item[0], categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop item', details: error.message });
  }
};

// POST /api/shop-items
const createShopItem = async (req, res) => {
  try {
    const { title, description, price, categoryIds = [] } = req.body;
    
    if (!title || price === undefined) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    if (price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }
    
    // Create the shop item
    const newItem = await db.insert(shopItems).values({ title, description, price }).returning();
    
    // Link to categories if provided
    if (categoryIds.length > 0) {
      const categoryLinks = categoryIds.map(categoryId => ({
        shopItemId: newItem[0].id,
        categoryId: parseInt(categoryId)
      }));
      
      await db.insert(shopItemsToCategories).values(categoryLinks);
    }

    // Fetch the created item with categories
    const categories = await db
      .select({
        id: shopItemCategories.id,
        title: shopItemCategories.title,
        description: shopItemCategories.description,
      })
      .from(shopItemCategories)
      .innerJoin(shopItemsToCategories, eq(shopItemCategories.id, shopItemsToCategories.categoryId))
      .where(eq(shopItemsToCategories.shopItemId, newItem[0].id));
    
    res.status(201).json({ ...newItem[0], categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shop item', details: error.message });
  }
};

// PUT /api/shop-items/:id
const updateShopItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryIds = [] } = req.body;
    
    if (!title || price === undefined) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    if (price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }
    
    // Update the shop item
    const updatedItem = await db
      .update(shopItems)
      .set({ title, description, price, updatedAt: new Date() })
      .where(eq(shopItems.id, parseInt(id)))
      .returning();
    
    if (updatedItem.length === 0) {
      return res.status(404).json({ error: 'Shop item not found' });
    }

    // Update category relationships
    await db.delete(shopItemsToCategories).where(eq(shopItemsToCategories.shopItemId, parseInt(id)));
    
    if (categoryIds.length > 0) {
      const categoryLinks = categoryIds.map(categoryId => ({
        shopItemId: parseInt(id),
        categoryId: parseInt(categoryId)
      }));
      
      await db.insert(shopItemsToCategories).values(categoryLinks);
    }

    // Fetch the updated item with categories
    const categories = await db
      .select({
        id: shopItemCategories.id,
        title: shopItemCategories.title,
        description: shopItemCategories.description,
      })
      .from(shopItemCategories)
      .innerJoin(shopItemsToCategories, eq(shopItemCategories.id, shopItemsToCategories.categoryId))
      .where(eq(shopItemsToCategories.shopItemId, parseInt(id)));
    
    res.json({ ...updatedItem[0], categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shop item', details: error.message });
  }
};

// DELETE /api/shop-items/:id
const deleteShopItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedItem = await db
      .delete(shopItems)
      .where(eq(shopItems.id, parseInt(id)))
      .returning();
    
    if (deletedItem.length === 0) {
      return res.status(404).json({ error: 'Shop item not found' });
    }
    
    res.json({ message: 'Shop item deleted successfully', item: deletedItem[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shop item', details: error.message });
  }
};

module.exports = {
  getAllShopItems,
  getShopItemById,
  createShopItem,
  updateShopItem,
  deleteShopItem,
};
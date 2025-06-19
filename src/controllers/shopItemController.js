import { db } from '../db/index.js';
import { shopItems, shopItemCategories } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Get all shop items with category information
export const getAllShopItems = async (req, res) => {
  try {
    const allShopItems = await db
      .select({
        id: shopItems.id,
        title: shopItems.title,
        description: shopItems.description,
        price: shopItems.price,
        categoryId: shopItems.categoryId,
        createdAt: shopItems.createdAt,
        updatedAt: shopItems.updatedAt,
        category: {
          id: shopItemCategories.id,
          title: shopItemCategories.title,
          description: shopItemCategories.description
        }
      })
      .from(shopItems)
      .leftJoin(shopItemCategories, eq(shopItems.categoryId, shopItemCategories.id));
    
    // Convert price to number for consistent response
    const itemsWithNumericPrice = allShopItems.map(item => ({
      ...item,
      price: Number(item.price)
    }));
    
    res.json(itemsWithNumericPrice);
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get shop item by ID with category information
export const getShopItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopItem = await db
      .select({
        id: shopItems.id,
        title: shopItems.title,
        description: shopItems.description,
        price: shopItems.price,
        categoryId: shopItems.categoryId,
        createdAt: shopItems.createdAt,
        updatedAt: shopItems.updatedAt,
        category: {
          id: shopItemCategories.id,
          title: shopItemCategories.title,
          description: shopItemCategories.description
        }
      })
      .from(shopItems)
      .leftJoin(shopItemCategories, eq(shopItems.categoryId, shopItemCategories.id))
      .where(eq(shopItems.id, parseInt(id)));
    
    if (shopItem.length === 0) {
      return res.status(404).json({ error: 'Shop item not found' });
    }
    
    // Convert price to number for consistent response
    const itemWithNumericPrice = {
      ...shopItem[0],
      price: Number(shopItem[0].price)
    };
    
    res.json(itemWithNumericPrice);
  } catch (error) {
    console.error('Error fetching shop item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new shop item
export const createShopItem = async (req, res) => {
  try {
    const { title, description, price, categoryId } = req.body;
    
    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }
    
    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }
    
    // Validate category exists if provided
    if (categoryId) {
      const category = await db.select().from(shopItemCategories).where(eq(shopItemCategories.id, categoryId));
      if (category.length === 0) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }
    
    const [newShopItem] = await db.insert(shopItems).values({
      title,
      description,
      price: parseFloat(price),
      categoryId: categoryId ? parseInt(categoryId) : null
    }).returning();
    
    // Convert price to number for consistent response
    const itemWithNumericPrice = {
      ...newShopItem,
      price: Number(newShopItem.price)
    };
    
    res.status(201).json(itemWithNumericPrice);
  } catch (error) {
    console.error('Error creating shop item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update shop item
export const updateShopItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryId } = req.body;
    
    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }
    
    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }
    
    // Validate category exists if provided
    if (categoryId) {
      const category = await db.select().from(shopItemCategories).where(eq(shopItemCategories.id, categoryId));
      if (category.length === 0) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }
    
    const [updatedShopItem] = await db.update(shopItems)
      .set({
        title,
        description,
        price: parseFloat(price),
        categoryId: categoryId ? parseInt(categoryId) : null,
        updatedAt: new Date()
      })
      .where(eq(shopItems.id, parseInt(id)))
      .returning();
    
    if (!updatedShopItem) {
      return res.status(404).json({ error: 'Shop item not found' });
    }
    
    // Convert price to number for consistent response
    const itemWithNumericPrice = {
      ...updatedShopItem,
      price: Number(updatedShopItem.price)
    };
    
    res.json(itemWithNumericPrice);
  } catch (error) {
    console.error('Error updating shop item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete shop item
export const deleteShopItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedShopItem] = await db.delete(shopItems)
      .where(eq(shopItems.id, parseInt(id)))
      .returning();
    
    if (!deletedShopItem) {
      return res.status(404).json({ error: 'Shop item not found' });
    }
    
    res.json({ message: 'Shop item deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
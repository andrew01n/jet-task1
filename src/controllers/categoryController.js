import { db } from '../db/index.js';
import { shopItemCategories } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const allCategories = await db.select().from(shopItemCategories);
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.select().from(shopItemCategories).where(eq(shopItemCategories.id, parseInt(id)));
    
    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const [newCategory] = await db.insert(shopItemCategories).values({
      title,
      description
    }).returning();
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const [updatedCategory] = await db.update(shopItemCategories)
      .set({
        title,
        description,
        updatedAt: new Date()
      })
      .where(eq(shopItemCategories.id, parseInt(id)))
      .returning();
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedCategory] = await db.delete(shopItemCategories)
      .where(eq(shopItemCategories.id, parseInt(id)))
      .returning();
    
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
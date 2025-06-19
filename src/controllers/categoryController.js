const { db } = require('../db');
const { shopItemCategories } = require('../db/schema');
const { eq } = require('drizzle-orm');

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const allCategories = await db.select().from(shopItemCategories);
    res.json(allCategories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.select().from(shopItemCategories).where(eq(shopItemCategories.id, parseInt(id))).limit(1);
    
    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category', details: error.message });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newCategory = await db.insert(shopItemCategories).values({ title, description }).returning();
    res.status(201).json(newCategory[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const updatedCategory = await db
      .update(shopItemCategories)
      .set({ title, description, updatedAt: new Date() })
      .where(eq(shopItemCategories.id, parseInt(id)))
      .returning();
    
    if (updatedCategory.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(updatedCategory[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category', details: error.message });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCategory = await db
      .delete(shopItemCategories)
      .where(eq(shopItemCategories.id, parseInt(id)))
      .returning();
    
    if (deletedCategory.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully', category: deletedCategory[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category', details: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
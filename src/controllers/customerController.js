const { db } = require('../db');
const { customers } = require('../db/schema');
const { eq } = require('drizzle-orm');

// GET /api/customers
const getAllCustomers = async (req, res) => {
  try {
    const allCustomers = await db.select().from(customers);
    res.json(allCustomers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
  }
};

// GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await db.select().from(customers).where(eq(customers.id, parseInt(id))).limit(1);
    
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
  }
};

// POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, surname, email } = req.body;
    
    if (!name || !surname || !email) {
      return res.status(400).json({ error: 'Name, surname, and email are required' });
    }
    
    const newCustomer = await db.insert(customers).values({ name, surname, email }).returning();
    res.status(201).json(newCustomer[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create customer', details: error.message });
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email } = req.body;
    
    if (!name || !surname || !email) {
      return res.status(400).json({ error: 'Name, surname, and email are required' });
    }
    
    const updatedCustomer = await db
      .update(customers)
      .set({ name, surname, email, updatedAt: new Date() })
      .where(eq(customers.id, parseInt(id)))
      .returning();
    
    if (updatedCustomer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(updatedCustomer[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update customer', details: error.message });
  }
};

// DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCustomer = await db
      .delete(customers)
      .where(eq(customers.id, parseInt(id)))
      .returning();
    
    if (deletedCustomer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully', customer: deletedCustomer[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer', details: error.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
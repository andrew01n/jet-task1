import { db } from '../db/index.js';
import { customers } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const allCustomers = await db.select().from(customers);
    res.json(allCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await db.select().from(customers).where(eq(customers.id, parseInt(id)));
    
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, surname, email } = req.body;
    
    if (!name || !surname || !email) {
      return res.status(400).json({ error: 'Name, surname, and email are required' });
    }
    
    const [newCustomer] = await db.insert(customers).values({
      name,
      surname,
      email
    }).returning();
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email } = req.body;
    
    if (!name || !surname || !email) {
      return res.status(400).json({ error: 'Name, surname, and email are required' });
    }
    
    const [updatedCustomer] = await db.update(customers)
      .set({
        name,
        surname,
        email,
        updatedAt: new Date()
      })
      .where(eq(customers.id, parseInt(id)))
      .returning();
    
    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedCustomer] = await db.delete(customers)
      .where(eq(customers.id, parseInt(id)))
      .returning();
    
    if (!deletedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
import { db } from '../db/index.js';
import { orders, customers, orderItems, shopItems, shopItemCategories } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Get all orders with customer and order items information
export const getAllOrders = async (req, res) => {
  try {
    const allOrders = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          surname: customers.surname,
          email: customers.email
        }
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id));
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const orderItemsData = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            shopItem: {
              id: shopItems.id,
              title: shopItems.title,
              description: shopItems.description,
              price: shopItems.price,
              category: {
                id: shopItemCategories.id,
                title: shopItemCategories.title,
                description: shopItemCategories.description
              }
            }
          })
          .from(orderItems)
          .leftJoin(shopItems, eq(orderItems.shopItemId, shopItems.id))
          .leftJoin(shopItemCategories, eq(shopItems.categoryId, shopItemCategories.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          items: orderItemsData
        };
      })
    );
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get order by ID with customer and order items information
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          surname: customers.surname,
          email: customers.email
        }
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, parseInt(id)));
    
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const orderItemsData = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        shopItem: {
          id: shopItems.id,
          title: shopItems.title,
          description: shopItems.description,
          price: shopItems.price,
          category: {
            id: shopItemCategories.id,
            title: shopItemCategories.title,
            description: shopItemCategories.description
          }
        }
      })
      .from(orderItems)
      .leftJoin(shopItems, eq(orderItems.shopItemId, shopItems.id))
      .leftJoin(shopItemCategories, eq(shopItems.categoryId, shopItemCategories.id))
      .where(eq(orderItems.orderId, parseInt(id)));
    
    const orderWithItems = {
      ...order[0],
      items: orderItemsData
    };
    
    res.json(orderWithItems);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { customerId, items } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer ID and items array are required' });
    }
    
    // Validate customer exists
    const customer = await db.select().from(customers).where(eq(customers.id, customerId));
    if (customer.length === 0) {
      return res.status(400).json({ error: 'Customer not found' });
    }
    
    // Validate all shop items exist
    for (const item of items) {
      if (!item.shopItemId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Each item must have shopItemId and quantity > 0' });
      }
      
      const shopItem = await db.select().from(shopItems).where(eq(shopItems.id, item.shopItemId));
      if (shopItem.length === 0) {
        return res.status(400).json({ error: `Shop item with ID ${item.shopItemId} not found` });
      }
    }
    
    // Create order
    const [newOrder] = await db.insert(orders).values({
      customerId: parseInt(customerId)
    }).returning();
    
    // Create order items
    const orderItemsData = items.map(item => ({
      orderId: newOrder.id,
      shopItemId: parseInt(item.shopItemId),
      quantity: parseInt(item.quantity)
    }));
    
    await db.insert(orderItems).values(orderItemsData);
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, items } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer ID and items array are required' });
    }
    
    // Validate order exists
    const existingOrder = await db.select().from(orders).where(eq(orders.id, parseInt(id)));
    if (existingOrder.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Validate customer exists
    const customer = await db.select().from(customers).where(eq(customers.id, customerId));
    if (customer.length === 0) {
      return res.status(400).json({ error: 'Customer not found' });
    }
    
    // Validate all shop items exist
    for (const item of items) {
      if (!item.shopItemId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Each item must have shopItemId and quantity > 0' });
      }
      
      const shopItem = await db.select().from(shopItems).where(eq(shopItems.id, item.shopItemId));
      if (shopItem.length === 0) {
        return res.status(400).json({ error: `Shop item with ID ${item.shopItemId} not found` });
      }
    }
    
    // Update order
    const [updatedOrder] = await db.update(orders)
      .set({
        customerId: parseInt(customerId),
        updatedAt: new Date()
      })
      .where(eq(orders.id, parseInt(id)))
      .returning();
    
    // Delete existing order items
    await db.delete(orderItems).where(eq(orderItems.orderId, parseInt(id)));
    
    // Create new order items
    const orderItemsData = items.map(item => ({
      orderId: parseInt(id),
      shopItemId: parseInt(item.shopItemId),
      quantity: parseInt(item.quantity)
    }));
    
    await db.insert(orderItems).values(orderItemsData);
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete order items first (due to foreign key constraint)
    await db.delete(orderItems).where(eq(orderItems.orderId, parseInt(id)));
    
    // Delete order
    const [deletedOrder] = await db.delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();
    
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
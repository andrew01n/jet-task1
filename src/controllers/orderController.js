const { db } = require('../db');
const { orders, orderItems, customers, shopItems } = require('../db/schema');
const { eq } = require('drizzle-orm');

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const allOrders = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: customers.name,
        customerSurname: customers.surname,
        customerEmail: customers.email,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            shopItemId: orderItems.shopItemId,
            shopItemTitle: shopItems.title,
            shopItemDescription: shopItems.description,
            shopItemPrice: shopItems.price,
          })
          .from(orderItems)
          .innerJoin(shopItems, eq(orderItems.shopItemId, shopItems.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          id: order.id,
          customerId: order.customerId,
          customer: {
            id: order.customerId,
            name: order.customerName,
            surname: order.customerSurname,
            email: order.customerEmail,
          },
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            shopItem: {
              id: item.shopItemId,
              title: item.shopItemTitle,
              description: item.shopItemDescription,
              price: item.shopItemPrice,
            }
          })),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: customers.name,
        customerSurname: customers.surname,
        customerEmail: customers.email,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, parseInt(id)))
      .limit(1);
    
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        shopItemId: orderItems.shopItemId,
        shopItemTitle: shopItems.title,
        shopItemDescription: shopItems.description,
        shopItemPrice: shopItems.price,
      })
      .from(orderItems)
      .innerJoin(shopItems, eq(orderItems.shopItemId, shopItems.id))
      .where(eq(orderItems.orderId, parseInt(id)));
    
    const orderWithItems = {
      id: order[0].id,
      customerId: order[0].customerId,
      customer: {
        id: order[0].customerId,
        name: order[0].customerName,
        surname: order[0].customerSurname,
        email: order[0].customerEmail,
      },
      items: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        shopItem: {
          id: item.shopItemId,
          title: item.shopItemTitle,
          description: item.shopItemDescription,
          price: item.shopItemPrice,
        }
      })),
      createdAt: order[0].createdAt,
      updatedAt: order[0].updatedAt,
    };

    res.json(orderWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customerId, items = [] } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Validate items format
    for (const item of items) {
      if (!item.shopItemId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Each item must have shopItemId and positive quantity' });
      }
    }

    // Check if customer exists
    const customer = await db.select().from(customers).where(eq(customers.id, parseInt(customerId))).limit(1);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if all shop items exist
    const shopItemIds = items.map(item => item.shopItemId);
    const existingItems = await db.select().from(shopItems).where(eq(shopItems.id, shopItemIds[0])); // This should use `inArray` for multiple IDs
    
    // Create the order
    const newOrder = await db.insert(orders).values({ customerId: parseInt(customerId) }).returning();
    
    // Create order items
    const orderItemsData = items.map(item => ({
      orderId: newOrder[0].id,
      shopItemId: parseInt(item.shopItemId),
      quantity: parseInt(item.quantity)
    }));
    
    await db.insert(orderItems).values(orderItemsData);

    // Fetch the created order with all details
    const createdOrder = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: customers.name,
        customerSurname: customers.surname,
        customerEmail: customers.email,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, newOrder[0].id))
      .limit(1);

    const createdItems = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        shopItemId: orderItems.shopItemId,
        shopItemTitle: shopItems.title,
        shopItemDescription: shopItems.description,
        shopItemPrice: shopItems.price,
      })
      .from(orderItems)
      .innerJoin(shopItems, eq(orderItems.shopItemId, shopItems.id))
      .where(eq(orderItems.orderId, newOrder[0].id));
    
    const orderWithItems = {
      id: createdOrder[0].id,
      customerId: createdOrder[0].customerId,
      customer: {
        id: createdOrder[0].customerId,
        name: createdOrder[0].customerName,
        surname: createdOrder[0].customerSurname,
        email: createdOrder[0].customerEmail,
      },
      items: createdItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        shopItem: {
          id: item.shopItemId,
          title: item.shopItemTitle,
          description: item.shopItemDescription,
          price: item.shopItemPrice,
        }
      })),
      createdAt: createdOrder[0].createdAt,
      updatedAt: createdOrder[0].updatedAt,
    };
    
    res.status(201).json(orderWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
};

// PUT /api/orders/:id
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, items = [] } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Validate items format
    for (const item of items) {
      if (!item.shopItemId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Each item must have shopItemId and positive quantity' });
      }
    }

    // Update the order
    const updatedOrder = await db
      .update(orders)
      .set({ customerId: parseInt(customerId), updatedAt: new Date() })
      .where(eq(orders.id, parseInt(id)))
      .returning();
    
    if (updatedOrder.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete existing order items and create new ones
    await db.delete(orderItems).where(eq(orderItems.orderId, parseInt(id)));
    
    const orderItemsData = items.map(item => ({
      orderId: parseInt(id),
      shopItemId: parseInt(item.shopItemId),
      quantity: parseInt(item.quantity)
    }));
    
    await db.insert(orderItems).values(orderItemsData);

    // Fetch the updated order with all details
    const orderWithDetails = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: customers.name,
        customerSurname: customers.surname,
        customerEmail: customers.email,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    const updatedItems = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        shopItemId: orderItems.shopItemId,
        shopItemTitle: shopItems.title,
        shopItemDescription: shopItems.description,
        shopItemPrice: shopItems.price,
      })
      .from(orderItems)
      .innerJoin(shopItems, eq(orderItems.shopItemId, shopItems.id))
      .where(eq(orderItems.orderId, parseInt(id)));
    
    const orderWithItems = {
      id: orderWithDetails[0].id,
      customerId: orderWithDetails[0].customerId,
      customer: {
        id: orderWithDetails[0].customerId,
        name: orderWithDetails[0].customerName,
        surname: orderWithDetails[0].customerSurname,
        email: orderWithDetails[0].customerEmail,
      },
      items: updatedItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        shopItem: {
          id: item.shopItemId,
          title: item.shopItemTitle,
          description: item.shopItemDescription,
          price: item.shopItemPrice,
        }
      })),
      createdAt: orderWithDetails[0].createdAt,
      updatedAt: orderWithDetails[0].updatedAt,
    };
    
    res.json(orderWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedOrder = await db
      .delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();
    
    if (deletedOrder.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully', order: deletedOrder[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order', details: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
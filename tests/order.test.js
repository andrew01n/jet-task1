import request from 'supertest';
import { db } from '../src/db/index.js';
import { orders } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

let app;

beforeAll(async () => {
  const { default: expressApp } = await import('../src/index.js');
  app = expressApp;
});

afterEach(async () => {
  // Clean up test data after each test
  // This is handled by the database constraints
});

describe('Order API', () => {
  describe('GET /api/orders', () => {
    it('should return all orders with customer and items information', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('customerId');
      expect(response.body[0]).toHaveProperty('customer');
      expect(response.body[0]).toHaveProperty('items');
      expect(Array.isArray(response.body[0].items)).toBe(true);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return an order by ID with customer and items information', async () => {
      const ordersResponse = await request(app)
        .get('/api/orders')
        .expect(200);

      const orderId = ordersResponse.body[0].id;

      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', orderId);
      expect(response.body).toHaveProperty('customerId');
      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Order not found');
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      // First get a customer ID
      const customersResponse = await request(app)
        .get('/api/customers')
        .expect(200);

      const customerId = customersResponse.body[0].id;

      // Get shop items
      const shopItemsResponse = await request(app)
        .get('/api/shop-items')
        .expect(200);

      const shopItemId = shopItemsResponse.body[0].id;

      const newOrder = {
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 2
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('customerId', customerId);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidOrder = {
        customerId: 1
        // Missing items
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for non-existent customer', async () => {
      const shopItemsResponse = await request(app)
        .get('/api/shop-items')
        .expect(200);

      const shopItemId = shopItemsResponse.body[0].id;

      const invalidOrder = {
        customerId: 99999, // Non-existent customer
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Customer not found');
    });

    it('should return 400 for non-existent shop item', async () => {
      const customersResponse = await request(app)
        .get('/api/customers')
        .expect(200);

      const customerId = customersResponse.body[0].id;

      const invalidOrder = {
        customerId: customerId,
        items: [
          {
            shopItemId: 99999, // Non-existent shop item
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid quantity', async () => {
      const customersResponse = await request(app)
        .get('/api/customers')
        .expect(200);

      const customerId = customersResponse.body[0].id;

      const shopItemsResponse = await request(app)
        .get('/api/shop-items')
        .expect(200);

      const shopItemId = shopItemsResponse.body[0].id;

      const invalidOrder = {
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 0 // Invalid quantity
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update an existing order', async () => {
      // First get a customer ID
      const customersResponse = await request(app)
        .get('/api/customers')
        .expect(200);

      const customerId = customersResponse.body[0].id;

      // Get shop items
      const shopItemsResponse = await request(app)
        .get('/api/shop-items')
        .expect(200);

      const shopItemId = shopItemsResponse.body[0].id;

      // First create an order
      const newOrder = {
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      const orderId = createResponse.body.id;

      // Update the order
      const updatedOrder = {
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 3
          }
        ]
      };

      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send(updatedOrder)
        .expect(200);

      expect(response.body).toHaveProperty('id', orderId);
      expect(response.body).toHaveProperty('customerId', customerId);
    });

    it('should return 404 for non-existent order', async () => {
      const customersResponse = await request(app)
        .get('/api/customers')
        .expect(200);

      const customerId = customersResponse.body[0].id;

      const shopItemsResponse = await request(app)
        .get('/api/shop-items')
        .expect(200);

      const shopItemId = shopItemsResponse.body[0].id;

      const updatedOrder = {
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .put('/api/orders/99999')
        .send(updatedOrder)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Order not found');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete an existing order', async () => {
      // First get a customer ID
      const customersResponse = await request(app)
        .get('/api/customers')
        .expect(200);

      const customerId = customersResponse.body[0].id;

      // Get shop items
      const shopItemsResponse = await request(app)
        .get('/api/shop-items')
        .expect(200);

      const shopItemId = shopItemsResponse.body[0].id;

      // First create an order
      const newOrder = {
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      const orderId = createResponse.body.id;

      // Delete the order
      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Order deleted successfully');

      // Verify order is deleted
      await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(404);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .delete('/api/orders/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Order not found');
    });
  });
}); 
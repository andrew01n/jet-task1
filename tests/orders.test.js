const request = require('supertest');
const app = require('../src/app');

describe('Order Endpoints', () => {
  let orderId;
  let customerId;
  let shopItemId;

  beforeAll(async () => {
    // Create a customer for testing orders
    const customerResponse = await request(app)
      .post('/api/customers')
      .send({
        name: 'Order',
        surname: 'Tester',
        email: 'order.tester@example.com'
      });
    customerId = customerResponse.body.id;

    // Create a shop item for testing orders
    const itemResponse = await request(app)
      .post('/api/shop-items')
      .send({
        title: 'Test Item for Orders',
        description: 'Item for order tests',
        price: 19.99
      });
    shopItemId = itemResponse.body.id;
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
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
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customerId).toBe(customerId);
      expect(response.body.customer).toHaveProperty('name', 'Order');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(2);
      expect(response.body.items[0].shopItem).toHaveProperty('id', shopItemId);
      
      orderId = response.body.id;
    });

    it('should return 400 for missing customer ID', async () => {
      const orderData = {
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for empty items array', async () => {
      const orderData = {
        customerId: customerId,
        items: []
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid item data', async () => {
      const orderData = {
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
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent customer', async () => {
      const orderData = {
        customerId: 99999,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check order structure
      const order = response.body.find(o => o.id === orderId);
      expect(order).toBeDefined();
      expect(order.customer).toHaveProperty('name');
      expect(order.items).toHaveLength(1);
      expect(order.items[0]).toHaveProperty('shopItem');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return a specific order', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', orderId);
      expect(response.body).toHaveProperty('customerId', customerId);
      expect(response.body.customer).toHaveProperty('name', 'Order');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].shopItem).toHaveProperty('title', 'Test Item for Orders');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update an order', async () => {
      const updateData = {
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 3 // Changed quantity
          }
        ]
      };

      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.customerId).toBe(customerId);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(3);
    });

    it('should return 404 for non-existent order', async () => {
      const updateData = {
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
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete an order', async () => {
      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('order');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .delete('/api/orders/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  afterAll(async () => {
    // Clean up test data
    await request(app).delete(`/api/shop-items/${shopItemId}`);
    await request(app).delete(`/api/customers/${customerId}`);
  });
});
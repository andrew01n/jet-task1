const request = require('supertest');
const app = require('../src/app');

describe('Customer Endpoints', () => {
  let customerId;

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'Test',
        surname: 'User',
        email: 'test.user@example.com'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(customerData.name);
      expect(response.body.surname).toBe(customerData.surname);
      expect(response.body.email).toBe(customerData.email);
      
      customerId = response.body.id;
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 for duplicate email', async () => {
      const customerData = {
        name: 'Another',
        surname: 'User',
        email: 'test.user@example.com' // Same email as before
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/customers', () => {
    it('should return all customers', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return a specific customer', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', customerId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('surname');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update a customer', async () => {
      const updateData = {
        name: 'Updated',
        surname: 'Name',
        email: 'updated.email@example.com'
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.surname).toBe(updateData.surname);
      expect(response.body.email).toBe(updateData.email);
    });

    it('should return 404 for non-existent customer', async () => {
      const updateData = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .put('/api/customers/99999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('customer');
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .delete('/api/customers/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
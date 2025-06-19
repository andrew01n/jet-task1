import request from 'supertest';
import { db } from '../src/db/index.js';
import { customers } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

// Import the app (we'll need to modify the main file to export it)
let app;

beforeAll(async () => {
  // Import the app dynamically
  const { default: expressApp } = await import('../src/index.js');
  app = expressApp;
});

afterEach(async () => {
  // Clean up test data after each test
  await db.delete(customers).where(eq(customers.email, 'test@example.com'));
  await db.delete(customers).where(eq(customers.email, 'updated@example.com'));
  await db.delete(customers).where(eq(customers.email, 'test1@example.com'));
  await db.delete(customers).where(eq(customers.email, 'test2@example.com'));
});

describe('Customer API', () => {
  describe('GET /api/customers', () => {
    it('should return all customers', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('surname');
      expect(response.body[0]).toHaveProperty('email');
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return a customer by ID', async () => {
      // First get all customers to get an existing ID
      const customersResponse = await request(app)
        .get('/api/customers')
        .expect(200);

      const customerId = customersResponse.body[0].id;

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

      expect(response.body).toHaveProperty('error', 'Customer not found');
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const newCustomer = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(newCustomer)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newCustomer.name);
      expect(response.body).toHaveProperty('surname', newCustomer.surname);
      expect(response.body).toHaveProperty('email', newCustomer.email);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidCustomer = {
        name: 'Test'
        // Missing surname and email
      };

      const response = await request(app)
        .post('/api/customers')
        .send(invalidCustomer)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate email', async () => {
      const customer1 = {
        name: 'Test1',
        surname: 'User1',
        email: 'test1@example.com'
      };

      const customer2 = {
        name: 'Test2',
        surname: 'User2',
        email: 'test1@example.com' // Same email
      };

      await request(app)
        .post('/api/customers')
        .send(customer1)
        .expect(201);

      const response = await request(app)
        .post('/api/customers')
        .send(customer2)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update an existing customer', async () => {
      // First create a customer
      const newCustomer = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com'
      };

      const createResponse = await request(app)
        .post('/api/customers')
        .send(newCustomer)
        .expect(201);

      const customerId = createResponse.body.id;

      // Update the customer
      const updatedCustomer = {
        name: 'Updated',
        surname: 'Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .send(updatedCustomer)
        .expect(200);

      expect(response.body).toHaveProperty('id', customerId);
      expect(response.body).toHaveProperty('name', updatedCustomer.name);
      expect(response.body).toHaveProperty('surname', updatedCustomer.surname);
      expect(response.body).toHaveProperty('email', updatedCustomer.email);
    });

    it('should return 404 for non-existent customer', async () => {
      const updatedCustomer = {
        name: 'Updated',
        surname: 'Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/customers/99999')
        .send(updatedCustomer)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Customer not found');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidCustomer = {
        name: 'Test'
        // Missing surname and email
      };

      const response = await request(app)
        .put('/api/customers/1')
        .send(invalidCustomer)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete an existing customer', async () => {
      // First create a customer
      const newCustomer = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com'
      };

      const createResponse = await request(app)
        .post('/api/customers')
        .send(newCustomer)
        .expect(201);

      const customerId = createResponse.body.id;

      // Delete the customer
      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Customer deleted successfully');

      // Verify customer is deleted
      await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(404);
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .delete('/api/customers/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Customer not found');
    });
  });
}); 
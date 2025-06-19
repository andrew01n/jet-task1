import request from 'supertest';
import { db } from '../src/db/index.js';
import { shopItemCategories } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

let app;

beforeAll(async () => {
  const { default: expressApp } = await import('../src/index.js');
  app = expressApp;
});

afterEach(async () => {
  // Clean up test data after each test
  await db.delete(shopItemCategories).where(eq(shopItemCategories.title, 'Test Category'));
});

describe('Category API', () => {
  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('description');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return a category by ID', async () => {
      const categoriesResponse = await request(app)
        .get('/api/categories')
        .expect(200);

      const categoryId = categoriesResponse.body[0].id;

      const response = await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', categoryId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/categories/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        title: 'Test Category',
        description: 'Test category description'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', newCategory.title);
      expect(response.body).toHaveProperty('description', newCategory.description);
    });

    it('should return 400 for missing title', async () => {
      const invalidCategory = {
        description: 'Test description'
        // Missing title
      };

      const response = await request(app)
        .post('/api/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update an existing category', async () => {
      // First create a category
      const newCategory = {
        title: 'Test Category',
        description: 'Test category description'
      };

      const createResponse = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      const categoryId = createResponse.body.id;

      // Update the category
      const updatedCategory = {
        title: 'Updated Category',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .send(updatedCategory)
        .expect(200);

      expect(response.body).toHaveProperty('id', categoryId);
      expect(response.body).toHaveProperty('title', updatedCategory.title);
      expect(response.body).toHaveProperty('description', updatedCategory.description);
    });

    it('should return 404 for non-existent category', async () => {
      const updatedCategory = {
        title: 'Updated Category',
        description: 'Updated description'
      };

      const response = await request(app)
        .put('/api/categories/99999')
        .send(updatedCategory)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete an existing category', async () => {
      // First create a category
      const newCategory = {
        title: 'Test Category',
        description: 'Test category description'
      };

      const createResponse = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      const categoryId = createResponse.body.id;

      // Delete the category
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Category deleted successfully');

      // Verify category is deleted
      await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(404);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .delete('/api/categories/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });
  });
}); 
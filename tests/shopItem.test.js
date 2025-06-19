import request from 'supertest';
import { db } from '../src/db/index.js';
import { shopItems } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

let app;

beforeAll(async () => {
  const { default: expressApp } = await import('../src/index.js');
  app = expressApp;
});

afterEach(async () => {
  // Clean up test data after each test
  await db.delete(shopItems).where(eq(shopItems.title, 'Test Item'));
});

describe('Shop Item API', () => {
  describe('GET /api/shop-items', () => {
    it('should return all shop items with category information', async () => {
      const response = await request(app)
        .get('/api/shop-items')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('price');
      expect(response.body[0]).toHaveProperty('category');
    });
  });

  describe('GET /api/shop-items/:id', () => {
    it('should return a shop item by ID with category information', async () => {
      const shopItemsResponse = await request(app)
        .get('/api/shop-items')
        .expect(200);

      const shopItemId = shopItemsResponse.body[0].id;

      const response = await request(app)
        .get(`/api/shop-items/${shopItemId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', shopItemId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent shop item', async () => {
      const response = await request(app)
        .get('/api/shop-items/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Shop item not found');
    });
  });

  describe('POST /api/shop-items', () => {
    it('should create a new shop item', async () => {
      // First get a category ID
      const categoriesResponse = await request(app)
        .get('/api/categories')
        .expect(200);

      const categoryId = categoriesResponse.body[0].id;

      const newShopItem = {
        title: 'Test Item',
        description: 'Test item description',
        price: 99.99,
        categoryId: categoryId
      };

      const response = await request(app)
        .post('/api/shop-items')
        .send(newShopItem)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', newShopItem.title);
      expect(response.body).toHaveProperty('description', newShopItem.description);
      expect(response.body).toHaveProperty('price', newShopItem.price);
      expect(response.body).toHaveProperty('categoryId', categoryId);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidShopItem = {
        description: 'Test description'
        // Missing title and price
      };

      const response = await request(app)
        .post('/api/shop-items')
        .send(invalidShopItem)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid price', async () => {
      const invalidShopItem = {
        title: 'Test Item',
        description: 'Test description',
        price: -10 // Invalid price
      };

      const response = await request(app)
        .post('/api/shop-items')
        .send(invalidShopItem)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Price must be greater than 0');
    });

    it('should return 400 for non-existent category', async () => {
      const invalidShopItem = {
        title: 'Test Item',
        description: 'Test description',
        price: 99.99,
        categoryId: 99999 // Non-existent category
      };

      const response = await request(app)
        .post('/api/shop-items')
        .send(invalidShopItem)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });
  });

  describe('PUT /api/shop-items/:id', () => {
    it('should update an existing shop item', async () => {
      // First get a category ID
      const categoriesResponse = await request(app)
        .get('/api/categories')
        .expect(200);

      const categoryId = categoriesResponse.body[0].id;

      // First create a shop item
      const newShopItem = {
        title: 'Test Item',
        description: 'Test item description',
        price: 99.99,
        categoryId: categoryId
      };

      const createResponse = await request(app)
        .post('/api/shop-items')
        .send(newShopItem)
        .expect(201);

      const shopItemId = createResponse.body.id;

      // Update the shop item
      const updatedShopItem = {
        title: 'Updated Item',
        description: 'Updated description',
        price: 149.99,
        categoryId: categoryId
      };

      const response = await request(app)
        .put(`/api/shop-items/${shopItemId}`)
        .send(updatedShopItem)
        .expect(200);

      expect(response.body).toHaveProperty('id', shopItemId);
      expect(response.body).toHaveProperty('title', updatedShopItem.title);
      expect(response.body).toHaveProperty('description', updatedShopItem.description);
      expect(response.body).toHaveProperty('price', updatedShopItem.price);
    });

    it('should return 404 for non-existent shop item', async () => {
      const updatedShopItem = {
        title: 'Updated Item',
        description: 'Updated description',
        price: 149.99
      };

      const response = await request(app)
        .put('/api/shop-items/99999')
        .send(updatedShopItem)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Shop item not found');
    });
  });

  describe('DELETE /api/shop-items/:id', () => {
    it('should delete an existing shop item', async () => {
      // First get a category ID
      const categoriesResponse = await request(app)
        .get('/api/categories')
        .expect(200);

      const categoryId = categoriesResponse.body[0].id;

      // First create a shop item
      const newShopItem = {
        title: 'Test Item',
        description: 'Test item description',
        price: 99.99,
        categoryId: categoryId
      };

      const createResponse = await request(app)
        .post('/api/shop-items')
        .send(newShopItem)
        .expect(201);

      const shopItemId = createResponse.body.id;

      // Delete the shop item
      const response = await request(app)
        .delete(`/api/shop-items/${shopItemId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Shop item deleted successfully');

      // Verify shop item is deleted
      await request(app)
        .get(`/api/shop-items/${shopItemId}`)
        .expect(404);
    });

    it('should return 404 for non-existent shop item', async () => {
      const response = await request(app)
        .delete('/api/shop-items/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Shop item not found');
    });
  });
}); 
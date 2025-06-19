const request = require('supertest');
const app = require('../src/app');

describe('Shop Item Endpoints', () => {
  let shopItemId;
  let categoryId;

  beforeAll(async () => {
    // Create a category for testing shop items
    const categoryResponse = await request(app)
      .post('/api/categories')
      .send({
        title: 'Test Category for Items',
        description: 'Category for shop item tests'
      });
    categoryId = categoryResponse.body.id;
  });

  describe('POST /api/shop-items', () => {
    it('should create a new shop item', async () => {
      const itemData = {
        title: 'Test Item',
        description: 'A test item description',
        price: 29.99,
        categoryIds: [categoryId]
      };

      const response = await request(app)
        .post('/api/shop-items')
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(itemData.title);
      expect(response.body.description).toBe(itemData.description);
      expect(response.body.price).toBe(itemData.price);
      expect(response.body.categories).toHaveLength(1);
      
      shopItemId = response.body.id;
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/shop-items')
        .send({ title: 'Incomplete Item' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for negative price', async () => {
      const itemData = {
        title: 'Negative Price Item',
        description: 'Item with negative price',
        price: -10.50
      };

      const response = await request(app)
        .post('/api/shop-items')
        .send(itemData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should create item without categories', async () => {
      const itemData = {
        title: 'No Category Item',
        description: 'Item without categories',
        price: 15.99
      };

      const response = await request(app)
        .post('/api/shop-items')
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.categories).toHaveLength(0);
    });
  });

  describe('GET /api/shop-items', () => {
    it('should return all shop items', async () => {
      const response = await request(app)
        .get('/api/shop-items')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check that items have categories array
      const itemWithCategories = response.body.find(item => item.categories.length > 0);
      if (itemWithCategories) {
        expect(itemWithCategories.categories[0]).toHaveProperty('id');
        expect(itemWithCategories.categories[0]).toHaveProperty('title');
      }
    });
  });

  describe('GET /api/shop-items/:id', () => {
    it('should return a specific shop item', async () => {
      const response = await request(app)
        .get(`/api/shop-items/${shopItemId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', shopItemId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
    });

    it('should return 404 for non-existent shop item', async () => {
      const response = await request(app)
        .get('/api/shop-items/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/shop-items/:id', () => {
    it('should update a shop item', async () => {
      const updateData = {
        title: 'Updated Item',
        description: 'Updated description',
        price: 39.99,
        categoryIds: [categoryId]
      };

      const response = await request(app)
        .put(`/api/shop-items/${shopItemId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.price).toBe(updateData.price);
      expect(response.body.categories).toHaveLength(1);
    });

    it('should return 404 for non-existent shop item', async () => {
      const updateData = {
        title: 'Non-existent Item',
        description: 'Description',
        price: 10.99
      };

      const response = await request(app)
        .put('/api/shop-items/99999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/shop-items/:id', () => {
    it('should delete a shop item', async () => {
      const response = await request(app)
        .delete(`/api/shop-items/${shopItemId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('item');
    });

    it('should return 404 for non-existent shop item', async () => {
      const response = await request(app)
        .delete('/api/shop-items/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  afterAll(async () => {
    // Clean up the test category
    await request(app).delete(`/api/categories/${categoryId}`);
  });
});
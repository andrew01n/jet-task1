const request = require('supertest');
const app = require('../src/app');

describe('Category Endpoints', () => {
  let categoryId;

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const categoryData = {
        title: 'Test Category',
        description: 'A test category description'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(categoryData.title);
      expect(response.body.description).toBe(categoryData.description);
      
      categoryId = response.body.id;
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ description: 'Description only' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should create category without description', async () => {
      const categoryData = {
        title: 'No Description Category'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(categoryData.title);
    });
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return a specific category', async () => {
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

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const updateData = {
        title: 'Updated Category',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent category', async () => {
      const updateData = {
        title: 'Non-existent Category'
      };

      const response = await request(app)
        .put('/api/categories/99999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .delete('/api/categories/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let testToken;
let testUserId;

// Mock Mapbox (for route creation)
jest.mock('axios', () => ({
  get: jest.fn((url) => {
    if (url.includes('directions')) {
      return Promise.resolve({
        data: {
          routes: [{
            distance: 5000,
            duration: 1200,
            geometry: {
              coordinates: [[80.63, 7.28], [80.64, 7.29]]
            }
          }]
        }
      });
    }
    if (url.includes('geocoding')) {
      return Promise.resolve({
        data: { features: [{ place_name: 'Kandy, Sri Lanka' }] }
      });
    }
  })
}));

// Create test user and generate token BEFORE EACH test
beforeEach(async () => {
  const user = new User({
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    role: 'user'
  });
  await user.save();
  testUserId = user._id.toString();

  testToken = jwt.sign(
    { userId: testUserId, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
});

// ==================== ADD FAVORITE ====================
describe('ADD Favorite', () => {
  let routeId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Test Route',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });
    routeId = res.body.route._id;
  });

  test('Successfully adds route to favorites', async () => {
    const res = await request(app)
      .post(`/api/favourites/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Route added to favorites');
    expect(res.body.favoriteRoutes).toContain(routeId);
  });

  test('Rejects duplicate favorite', async () => {
    await request(app)
      .post(`/api/favourites/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`);

    const res = await request(app)
      .post(`/api/favourites/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Route already in favorites');
  });

  test('Rejects invalid route ID', async () => {
    const res = await request(app)
      .post('/api/favourites/invalidid123')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('Invalid route ID format');
  });

  test('Rejects non-existent route', async () => {
    const res = await request(app)
      .post('/api/favourites/000000000000000000000000')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });

  test('Requires authentication', async () => {
    const res = await request(app)
      .post(`/api/favourites/${routeId}`);
    expect(res.statusCode).toBe(401);
  });
});

// ==================== REMOVE FAVORITE ====================
describe('REMOVE Favorite', () => {
  let routeId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Test Route',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });
    routeId = res.body.route._id;

    await request(app)
      .post(`/api/favourites/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`);
  });

  test('Successfully removes route from favorites', async () => {
    const res = await request(app)
      .delete(`/api/favourites/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Route removed from favorites');
    expect(res.body.favoriteRoutes).not.toContain(routeId);
  });

  test('Rejects removing non-favorited route', async () => {
    const res2 = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Another Route',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });
    const otherRouteId = res2.body.route._id;

    const res = await request(app)
      .delete(`/api/favourites/${otherRouteId}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Route not in favorites');
  });

  test('Rejects invalid route ID', async () => {
    const res = await request(app)
      .delete('/api/favourites/invalidid123')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('Invalid route ID format');
  });

  test('Requires authentication', async () => {
    const res = await request(app)
      .delete(`/api/favourites/${routeId}`);
    expect(res.statusCode).toBe(401);
  });
});

// ==================== GET FAVORITES ====================
describe('GET Favorites', () => {
  test('Returns favorites list (may be empty or have items)', async () => {
    const res = await request(app)
      .get('/api/favourites')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.routes)).toBe(true);
  });

  test('Returns all favorited routes', async () => {
    const res1 = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Route 1',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });

    const res2 = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Route 2',
        coordinates: [[80.65, 7.30], [80.66, 7.31]],
        isPublic: true
      });

    await request(app)
      .post(`/api/favourites/${res1.body.route._id}`)
      .set('Authorization', `Bearer ${testToken}`);

    await request(app)
      .post(`/api/favourites/${res2.body.route._id}`)
      .set('Authorization', `Bearer ${testToken}`);

    const res = await request(app)
      .get('/api/favourites')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
    expect(res.body.routes.length).toBeGreaterThanOrEqual(2);
  });

  test('Requires authentication', async () => {
    const res = await request(app)
      .get('/api/favourites');
    expect(res.statusCode).toBe(401);
  });
});
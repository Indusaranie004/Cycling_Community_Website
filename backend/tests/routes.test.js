require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

// Generate test token using real JWT_SECRET
const testToken = jwt.sign(
  { userId: 'test-user-123', role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

// Mock Mapbox API calls
jest.mock('axios', () => ({
  get: jest.fn((url) => {
    if (url.includes('directions')) {
      return Promise.resolve({
        data: {
          routes: [{
            distance: 5000,
            duration: 1200
          }]
        }
      });
    }
    if (url.includes('geocoding')) {
      return Promise.resolve({
        data: {
          features: [{
            place_name: 'Kandy, Sri Lanka'
          }]
        }
      });
    }
  })
}));

// ==================== CREATE ====================
describe('CREATE Route', () => {
  test('Successfully creates route with valid data', async () => {
    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Morning Ride',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Route created successfully');
  });

  test('Rejects missing name', async () => {
    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('Route name is required');
  });

  test('Rejects less than 2 coordinates', async () => {
    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Morning Ride',
        coordinates: [[80.63, 7.28]],
        isPublic: true
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('At least 2 coordinates are required');
  });

  test('Rejects missing visibility status', async () => {
    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Morning Ride',
        coordinates: [[80.63, 7.28], [80.64, 7.29]]
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('Visibility status is required');
  });

  test('Rejects duplicate name for same user', async () => {
    await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Morning Ride',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });

    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Morning Ride',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: false
      });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('You already have a route with this name');
  });
});

// ==================== READ ====================
describe('READ Routes', () => {
  test('Returns all public routes when no userId provided', async () => {
    const res = await request(app)
      .get('/api/routes/viewRoutes?isPublic=true')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.routes).toBeDefined();
  });

  test('Returns own routes with correct userId', async () => {
    const res = await request(app)
      .get('/api/routes/viewRoutes?userId=test-user-123')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('Returns only public routes when viewing another users routes', async () => {
    const res = await request(app)
      .get('/api/routes/viewRoutes?userId=test-user-456')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(200);
    res.body.routes.forEach(route => {
      expect(route.isPublic).toBe(true);
    });
  });
});

// ==================== UPDATE ====================
describe('UPDATE Route', () => {
  let routeId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Morning Ride',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });
    routeId = res.body.route._id;
  });

  test('Successfully updates name only', async () => {
    const res = await request(app)
      .put(`/api/routes/updateRoute/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Evening Ride' });
    expect(res.statusCode).toBe(200);
    expect(res.body.route.name).toBe('Evening Ride');
  });

  test('Successfully updates visibility only', async () => {
    const res = await request(app)
      .put(`/api/routes/updateRoute/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ isPublic: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.route.isPublic).toBe(false);
  });

  test('Rejects empty body', async () => {
    const res = await request(app)
      .put(`/api/routes/updateRoute/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('At least one field must be provided for update');
  });

  test('Rejects invalid MongoDB ID', async () => {
    const res = await request(app)
      .put('/api/routes/updateRoute/invalidid123')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'New Name' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('Invalid route ID format');
  });

  test('Rejects duplicate name for same user', async () => {
    await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Evening Ride',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });

    const res = await request(app)
      .put(`/api/routes/updateRoute/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Evening Ride' });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('You already have a route with this name');
  });

  test('Allows same name when not changed', async () => {
    const res = await request(app)
      .put(`/api/routes/updateRoute/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Morning Ride' });
    expect(res.statusCode).toBe(200);
  });
});

// ==================== DELETE ====================
describe('DELETE Route', () => {
  let routeId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/routes/newRoute')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Morning Ride',
        coordinates: [[80.63, 7.28], [80.64, 7.29]],
        isPublic: true
      });
    routeId = res.body.route._id;
  });

  test('Successfully deletes own route', async () => {
    const res = await request(app)
      .delete(`/api/routes/deleteRoute/${routeId}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Route deleted successfully');
  });

  test('Rejects invalid MongoDB ID', async () => {
    const res = await request(app)
      .delete('/api/routes/deleteRoute/invalidid123')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('Invalid route ID format');
  });

  test('Returns 404 for non-existent route', async () => {
    const res = await request(app)
      .delete('/api/routes/deleteRoute/000000000000000000000000')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});
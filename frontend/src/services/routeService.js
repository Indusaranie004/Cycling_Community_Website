import api from './api';

// GET all public routes
export const getPublicRoutes = () =>
  api.get('/api/routes/viewRoutes');

// GET routes for a specific user (own routes)
export const getUserRoutes = (userId) =>
  api.get(`/api/routes/viewRoutes?userId=${userId}`);

// GET nearby routes by coordinates and radius
export const getNearbyRoutes = (lat, lng, radius = 5000) =>
  api.get(`/api/routes/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);

// POST create a new route
export const createRoute = (data) =>
  api.post('/api/routes/newRoute', data);

// PUT update an existing route
export const updateRoute = (id, data) =>
  api.put(`/api/routes/updateRoute/${id}`, data);

// DELETE a route
export const deleteRoute = (id) =>
  api.delete(`/api/routes/deleteRoute/${id}`);
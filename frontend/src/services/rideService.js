import api from './api';

// POST /api/rides — save a completed ride
export const createRide = (data) => api.post('/api/rides', data);

// GET /api/rides/me — my ride history list
export const getMyRides = () => api.get('/api/rides/me');

// GET /api/rides/stats/me — personal aggregate stats
export const getMyStats = () => api.get('/api/rides/stats/me');

// GET /api/rides/:id — single ride (used by modal)
export const getRideById = (id) => api.get(`/api/rides/${id}`);

// PUT /api/rides/:id — update distance, duration, start/end time
export const updateRide = (id, data) => api.put(`/api/rides/${id}`, data);

// DELETE /api/rides/:id
export const deleteRide = (id) => api.delete(`/api/rides/${id}`);

// GET /api/impact/:rideId — eco impact for a single ride (used by modal)
export const getImpactByRideId = (rideId) => api.get(`/api/impact/${rideId}`);

// GET /api/impact/stats/me — eco impact aggregate (for profile dashboard later)
export const getMyImpactStats = () => api.get('/api/impact/stats/me');
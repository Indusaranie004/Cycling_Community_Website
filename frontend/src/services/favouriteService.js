import api from './api';

export const getFavourites = () => api.get('/api/favourites');
export const addFavourite = (routeId) => api.post(`/api/favourites/${routeId}`);
export const removeFavourite = (routeId) => api.delete(`/api/favourites/${routeId}`);
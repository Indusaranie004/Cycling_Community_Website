import api from './api';

// Get basic user profile
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Get community profile with statistics
export const getUserCommunityProfile = async () => {
  const response = await api.get('api/users/profile/community');
  return response.data;
};

export default {
  getUserProfile,
  getUserCommunityProfile
};
import api from './api';

// ==================== EVENTS ====================

export const getEvents = async () => {
  const response = await api.get('/community/events');
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/community/events', eventData);
  return response.data;
};

export const updateEvent = async (eventId, eventData) => {
  const response = await api.patch(`/community/events/${eventId}`, eventData);
  return response.data;
};

export const joinEvent = async (eventId) => {
  const response = await api.post(`/community/events/${eventId}/join`);
  return response.data;
};

export const withdrawFromEvent = async (eventId) => {
  const response = await api.post(`/community/events/${eventId}/withdraw`);
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/community/events/${eventId}`);
  return response.data;
};

export const getEventParticipants = async (eventId) => {
  const response = await api.get(`/community/events/${eventId}/participants`);
  return response.data;
};

// ==================== CHALLENGES ====================

export const getChallenges = async () => {
  const response = await api.get('/community/challenges');
  return response.data;
};

export const createChallenge = async (challengeData) => {
  const response = await api.post('/community/challenges', challengeData);
  return response.data;
};

export const joinChallenge = async (challengeId) => {
  const response = await api.post(`/community/challenges/${challengeId}/join`);
  return response.data;
};

export const getLeaderboard = async (challengeId) => {
  const response = await api.get(`/community/challenges/${challengeId}/leaderboard`);
  return response.data;
};

export const updateProgress = async (challengeId, distance) => {
  const response = await api.put(`/community/challenges/${challengeId}/progress`, {
    distance
  });
  return response.data;
};

export const getUserJoinedChallenges = async () => {
  const response = await api.get('/community/challenges/my-challenges');
  return response.data;
};

// ==================== DEFAULT EXPORT ====================

// ✅ Fix: Assign to variable before exporting
const communityService = {
  getEvents,
  createEvent,
  updateEvent,
  joinEvent,
  withdrawFromEvent,
  deleteEvent,
  getEventParticipants,
  getChallenges,
  createChallenge,
  joinChallenge,
  getLeaderboard,
  updateProgress,
  getUserJoinedChallenges
  };

export default communityService;  
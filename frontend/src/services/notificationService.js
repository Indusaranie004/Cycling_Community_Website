const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_URL = `${BASE_URL}/api/notifications`;

export const notificationService = {
    // Get notifications for a specific user
    getAll: async (userId, token) => {
        const response = await fetch(`${API_URL}?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error);
        return json;
    },

    // Delete a notification
    delete: async (id, token) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error);
        return json;
    },

    // Trigger manual check (Admin tool)
    triggerExpiry: async (token) => {
        const response = await fetch(`${API_URL}/trigger-expiry`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    }
};
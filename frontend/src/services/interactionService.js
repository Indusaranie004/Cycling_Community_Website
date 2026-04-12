// export const createInteraction = async (data, token) => {
//   const res = await fetch("http://localhost:3001/api/interactions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) {
//     const errorData = await res.json();
//     throw new Error(errorData.message || "Failed to create interaction");
//   }

//   return res.json();
// };

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const createInteraction = async (formData, token) => {
  const res = await fetch(`${BASE_URL}/api/interactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, 
  });

  const data = await res.json(); // 👈 Read the actual response from the backend

  if (!res.ok) {
    console.error("BACKEND 400 ERROR:", data); // 👈 THIS WILL TELL US THE EXACT PROBLEM
    throw new Error(data.message || data.error || "Failed to create interaction");
  }

  return data;
};

export const getUserInteractions = async (token) => {
  const res = await fetch(`${BASE_URL}/api/interactions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
};

// Update an existing interaction
export const updateInteraction = async (id, formData, token) => {
  const res = await fetch(`${BASE_URL}/api/interactions/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json(); // 👈 always read response

  if (!res.ok) {
    console.error("BACKEND ERROR:", data); // 👈 THIS is what we need
    throw new Error(data.error || JSON.stringify(data));
  }

  return data;
};

// Delete an interaction
export const deleteInteraction = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/interactions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete interaction");
  return res.json();
};

export const getActiveHazards = async (token) => {
  const res = await fetch(`${BASE_URL}/api/interactions/active-hazards`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch hazards');
  return res.json();
};

export const getRouteFeedback = async (routeId, token) => {
  // Use backticks (`) and ensure no spaces around ${routeId}
  const url = `${BASE_URL}/api/interactions/route/${routeId}/feedback`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Ensure space after Bearer
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Feedback Fetch Error:", errorData);
    throw new Error('Failed to fetch feedback');
  }
  
  return res.json();
};
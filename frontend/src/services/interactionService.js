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

export const createInteraction = async (formData, token) => {
  // formData here is a New FormData() object
  const res = await fetch("http://localhost:3001/api/interactions", {
    method: "POST",
    headers: {
      // "Content-Type" is OMITTED here so the browser sets it automatically
      Authorization: `Bearer ${token}`,
    },
    body: formData, 
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create interaction");
  }

  return res.json();
};

export const getUserInteractions = async (token) => {
  const res = await fetch("http://localhost:3001/api/interactions", {
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
  const res = await fetch(`http://localhost:3001/api/interactions/${id}`, {
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
  const res = await fetch(`http://localhost:3001/api/interactions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete interaction");
  return res.json();
};
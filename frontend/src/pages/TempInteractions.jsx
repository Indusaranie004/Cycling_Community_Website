import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateInteraction from '../components/interactions/CreateInteraction'; // Ensure naming matches
import { createInteraction } from '../services/interactionService'; // Path to your API function

export default function MapPage() {
  const { user, token } = useAuth(); // Assume token is stored in AuthContext
  const [showModal, setShowModal] = useState(false);

  const handleCreateSubmit = async (formData) => {
    try {
      // 1. Call the actual API utility
      const result = await createInteraction(formData, token);
      
      console.log("Success:", result);
      alert("Report submitted successfully!");
      
      // 2. Close modal after success
      setShowModal(false); 
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-10 text-brand-dark">
      <h1 className="text-4xl font-black mb-4">Temporary page for interaction Management</h1>
      

      <button 
        onClick={() => setShowModal(true)}
        className="mt-8 bg-brand-dark text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-dark/90 shadow-xl transition-all active:scale-95"
      >
        🚩 Report Road Issue
      </button>

      {showModal && (
        <CreateInteraction
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}
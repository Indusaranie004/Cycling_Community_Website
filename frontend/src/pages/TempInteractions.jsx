import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateInteraction from '../components/interactions/CreateInteraction'; 
import UserActivityModal from '../components/interactions/UserActivityModal'; // New Import
import { createInteraction } from '../services/interactionService'; 

export default function MapPage() {
  const { user, token } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleCreateSubmit = async (formData) => {
    try {
      const result = await createInteraction(formData, token);
      console.log("Success:", result);
      alert("Report submitted successfully!");
      setShowCreateModal(false); 
      // Refresh logic could go here if needed
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-10 text-brand-dark">
      <h1 className="text-4xl font-black mb-2">Interaction Management</h1>
      <p className="text-brand-dark/50 mb-8">Welcome back, {user?.name}</p>

      <div className="flex gap-4">
        {/* Button 1: Create */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-brand-orange text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>➕</span> Create Interaction
        </button>

        {/* Button 2: View History */}
        <button 
          onClick={() => setShowHistoryModal(true)}
          className="bg-brand-dark text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-dark/90 shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <span>📋</span> My Activities
        </button>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <CreateInteraction
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <UserActivityModal
          token={token}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
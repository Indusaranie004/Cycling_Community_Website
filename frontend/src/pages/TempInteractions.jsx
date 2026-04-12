import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateInteraction from '../components/interactions/CreateInteraction'; 
import UserActivityModal from '../components/interactions/UserActivityModal'; 
import NotificationHistory from './NotificationHistory';
import { createInteraction } from '../services/interactionService'; 

// Note: I renamed this to InteractionsPage to avoid confusion with your actual MapPage
export default function InteractionsPage() {
  const { user, token } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const handleCreateSubmit = async (formData) => {
    try {
      await createInteraction(formData, token);
      alert("Report submitted successfully!");
      setShowCreateModal(false); 
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div 
      className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-10 text-brand-dark transition-all duration-200"
      /* THIS STYLE BLOCK BELOW IS WHAT FIXES THE OVERLAP */
      style={{
        marginLeft: 'var(--map-sidebar-width, 0px)',
        width: 'calc(100vw - var(--map-sidebar-width, 0px))',
      }}
    >
      <h1 className="text-4xl font-black mb-2">Interaction Management</h1>
      <p className="text-brand-dark/50 mb-8">Welcome back, {user?.name}</p>

      <div className="flex gap-4">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-brand-orange text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>➕</span> Create Interaction
        </button>

        <button 
          onClick={() => setShowHistoryModal(true)}
          className="bg-brand-dark text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-dark/90 shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <span>📋</span> My Activities
        </button>

        <button 
          onClick={() => setShowNotifModal(true)}
          className="bg-white text-brand-dark border-2 border-brand-dark px-8 py-3 rounded-2xl font-bold hover:bg-brand-dark hover:text-white transition-all active:scale-95 flex items-center gap-2"
        >
          <span>🔔</span> Notifications
        </button>
      </div>

      {/* ... (Your existing Modals) ... */}
      {showCreateModal && (
        <CreateInteraction
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
      {showHistoryModal && (
        <UserActivityModal
          token={token}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
      {showNotifModal && (
        <NotificationHistory
          token={token}
          onClose={() => setShowNotifModal(false)}
        />
      )}
    </div>
  );
}
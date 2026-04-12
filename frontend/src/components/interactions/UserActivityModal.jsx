import React, { useEffect, useState, useMemo } from "react";
import { getUserInteractions, deleteInteraction, updateInteraction } from "../../services/interactionService";
import EditInteraction from '../interactions/EditInteraction';

export default function UserActivityModal({ onClose, token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  
  // New Filter State: 'all', 'hazard', 'feedback', 'expired'
  const [activeFilter, setActiveFilter] = useState('all');

  // --- HELPER FUNCTION FOR ROUNDED TIME ---
  const getRelativeTime = (expiryDateStr) => {
    if (!expiryDateStr) return "N/A";
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const diffInMs = expiry - now;
    if (diffInMs <= 0) return "Expired";
    const diffInMins = Math.round(diffInMs / (1000 * 60));
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMins < 1) return "Less than 1 min";
    if (diffInMins < 60) return `${diffInMins} mins`; 
    if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? 's' : ''}`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getUserInteractions(token);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [token]);

  // --- FILTER LOGIC ---
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const isPast = act.expiryTime && new Date(act.expiryTime) < new Date();
      const isExpired = act.isActive === false || isPast;

      if (activeFilter === 'all') return true;
      if (activeFilter === 'hazard') return act.intType === 'hazard' && !isExpired;
      if (activeFilter === 'feedback') return act.intType === 'feedback';
      if (activeFilter === 'expired') return isExpired;
      return true;
    });
  }, [activities, activeFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteInteraction(id, token);
      setActivities(activities.filter(a => a._id !== id)); 
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await updateInteraction(id, formData, token);
      await loadData(); 
      setEditingItem(null);
    } catch (err) {
      alert("Update failed");
    }
  };

  // Helper for filter button styles
  const filterBtnClass = (filterName) => `
    px-4 py-1.5 rounded-full text-xs font-bold transition-all border-2
    ${activeFilter === filterName 
      ? 'bg-brand-orange border-brand-orange text-white' 
      : 'bg-transparent border-gray-200 text-gray-500 hover:border-brand-orange/50 hover:text-brand-orange'}
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b bg-brand-cream/10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">My Activity History</h2>
              <p className="text-sm text-gray-500">Manage your reports and feedback</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-brand-dark transition-colors text-2xl">✕</button>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2 border-t pt-4">
            <button onClick={() => setActiveFilter('all')} className={filterBtnClass('all')}>All Activities</button>
            <button onClick={() => setActiveFilter('hazard')} className={filterBtnClass('hazard')}>Active Hazards</button>
            <button onClick={() => setActiveFilter('feedback')} className={filterBtnClass('feedback')}>Feedback</button>
            <button onClick={() => setActiveFilter('expired')} className={filterBtnClass('expired')}>Expired/Inactive</button>
          </div>
        </div>

        <div className="overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
               <p className="text-4xl mb-2">🔎</p>
               <p>No {activeFilter === 'all' ? '' : activeFilter} activities found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b">
                  <th className="pb-3 px-2 font-black">Type</th>
                  <th className="pb-3 px-2 font-black">Details</th>
                  <th className="pb-3 px-2 font-black">Status/Rating</th>
                  <th className="pb-3 px-2 font-black">Time Status</th>
                  {/* <th className="pb-3 px-2 font-black">Photo</th> */}
                  <th className="pb-3 px-2 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredActivities.map((act) => {
                  const isPast = act.expiryTime && new Date(act.expiryTime) < new Date();
                  const isExpired = act.isActive === false || isPast;

                  return (
                    <tr key={act._id} className="border-b group hover:bg-brand-cream/5 transition-colors">
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${act.intType === 'hazard' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {act.intType}
                        </span>
                      </td>
                      <td className="py-4 px-2 max-w-[220px]">
                        <p className="truncate font-medium text-brand-dark">{act.intDescription}</p>
                        <p className="text-[10px] text-gray-400 font-mono uppercase">{act.interactionId?.slice(0,8)}</p>
                      </td>
                      <td className="py-4 px-2">
                        {act.intType === 'hazard' ? (
                          <span className={`capitalize font-bold ${act.severityLevel === 'high' ? 'text-red-500' : 'text-orange-500'}`}>
                            {act.severityLevel}
                          </span>
                        ) : (
                          <span className="text-brand-orange font-bold">
                            {"⭐".repeat(act.intRating)}
                          </span>
                        )}
                      </td>
                      
                      <td className="py-4 px-2">
                        {act.intType === 'hazard' ? (
                          <span className={`text-xs font-bold ${isExpired ? "text-red-400" : "text-green-600"}`}>
                            {isExpired ? "🔴 Expired" : `🟢 ${getRelativeTime(act.expiryTime)}`}
                          </span>
                        ) : (
                          <span className="text-gray-300 italic">Permanent</span>
                        )}
                      </td>

                      {/* <td className="py-4 px-2">
                        {act.intImgUrl ? (
                          <img src={act.intImgUrl} className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-300">N/A</div>
                        )}
                      </td> */}
                      <td className="py-4 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => setEditingItem(act)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(act._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editingItem && (
        <EditInteraction 
          interaction={editingItem} 
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
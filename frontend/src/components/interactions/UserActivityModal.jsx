import React, { useEffect, useState } from "react";
import { getUserInteractions, deleteInteraction, updateInteraction } from "../../services/interactionService";
import EditInteraction from '../interactions/EditInteraction';

export default function UserActivityModal({ onClose, token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

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
    // If you specifically want 45 mins to say "1 hr", use:
    // if (diffInMins < 60) return diffInMins >= 45 ? "1 hr" : `${diffInMins} mins`;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        <div className="p-6 border-b flex justify-between items-center bg-brand-cream/20">
          <h2 className="text-2xl font-bold">My Activity History</h2>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>

        <div className="overflow-auto p-6">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3">Status/Rating</th>
                  <th className="pb-3">Expires In</th> {/* NEW COLUMN */}
                  <th className="pb-3">Photo</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {activities.map((act) => (
                  <tr key={act._id} className="border-b group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${act.intType === 'hazard' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        {act.intType}
                      </span>
                    </td>
                    <td className="py-4 max-w-[200px] truncate">{act.intDescription}</td>
                    <td className="py-4 font-medium capitalize">
                      {act.intType === 'hazard' ? act.severityLevel : `⭐ ${act.intRating}`}
                    </td>
                    
                    {/* DISPLAY ROUNDED TIME */}
                    <td className="py-4">
                      {act.intType === 'hazard' ? (
                        <span className={act.expiryTime && new Date(act.expiryTime) < new Date() ? "text-red-400" : "text-gray-600"}>
                          {getRelativeTime(act.expiryTime)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="py-4">
                      {act.intImgUrl && <img src={act.intImgUrl} className="w-8 h-8 rounded object-cover border" alt="" />}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingItem(act)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(act._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
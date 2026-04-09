import React, { useEffect, useState } from "react";
import { getUserInteractions } from "../../services/interactionService";

export default function UserActivityModal({ onClose, token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUserInteractions(token);
        setActivities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-cream/30">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">My Reports</h2>
            <p className="text-sm text-brand-dark/50">History of your hazards and feedback</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="overflow-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-brand-dark/40">Loading your history...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 italic">No reports found yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-brand-dark/40 border-b">
                  <th className="pb-3 pl-2">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Severity/Rating</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Photo</th>
                </tr>
              </thead>
              <tbody className="text-sm text-brand-dark/80">
                {activities.map((act) => (
                  <tr key={act._id} className="border-b hover:bg-brand-cream/20 transition-colors">
                    <td className="py-4 pl-2">
                      <span className={`px-2 py-1 rounded-md font-bold text-[10px] uppercase ${act.intType === 'hazard' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {act.intType}
                      </span>
                    </td>
                    <td className="py-4 max-w-xs truncate pr-4" title={act.intDescription}>
                      {act.intDescription}
                    </td>
                    <td className="py-4 capitalize font-semibold">
                      {act.intType === 'hazard' ? (
                        <span className={act.severityLevel === 'high' ? 'text-red-500' : ''}>
                          {act.severityLevel}
                        </span>
                      ) : (
                        <span>⭐ {act.intRating}/5</span>
                      )}
                    </td>
                    <td className="py-4 text-gray-500">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      {act.intImgUrl ? (
                        <a href={act.intImgUrl} target="_blank" rel="noreferrer">
                          <img src={act.intImgUrl} alt="Report" className="w-10 h-10 object-cover rounded-lg border hover:scale-110 transition-transform" />
                        </a>
                      ) : (
                        <span className="text-gray-300">No image</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-right">
          <button onClick={onClose} className="bg-brand-dark text-white px-6 py-2 rounded-xl font-bold text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
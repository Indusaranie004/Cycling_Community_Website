import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

export default function NotificationsPage() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Assuming your service takes (userId, token)
        const data = await notificationService.getAll(user.id, token);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) fetchNotifications();
  }, [user, token]);

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id, token);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      alert("Could not delete notification");
    }
  };

  return (
    <div 
      className="min-h-screen bg-brand-cream text-brand-dark transition-all duration-200"
      style={{
        marginLeft: 'var(--map-sidebar-width, 0px)',
        width: 'calc(100vw - var(--map-sidebar-width, 0px))',
      }}
    >
      <div className="max-w-4xl mx-auto p-8 md:p-12">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Notifications</h1>
            <p className="text-brand-dark/50 mt-2 font-medium">
              Stay updated with your latest route interactions.
            </p>
          </div>
          <span className="bg-brand-orange/10 text-brand-orange px-4 py-1.5 rounded-full text-sm font-bold">
            {notifications.length} Total
          </span>
        </div>

        {/* List Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-orange"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/50 rounded-3xl p-12 text-center border-2 border-dashed border-brand-dark/10">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold">All caught up!</h3>
            <p className="text-brand-dark/50">You don't have any new notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className="group relative bg-white border border-brand-dark/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex items-start gap-4"
              >
                {/* Status Indicator Dot */}
                <div className={`mt-2 h-3 w-3 shrink-0 rounded-full ${n.status === 'sent' ? 'bg-green-500' : 'bg-brand-orange'}`} />
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-lg leading-tight">{n.title}</h4>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-dark/30">
                       {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-brand-dark/70 mt-1 leading-relaxed">
                    {n.body}
                  </p>
                </div>

                {/* Delete Button - Shows on Hover */}
                <button 
                  onClick={() => handleDelete(n._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
                  title="Remove"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
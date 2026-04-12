import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/notifications`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setNotifications(res.data);
            } catch (error) {
                console.error("Error fetching notifications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div 
            className="min-h-screen bg-brand-cream text-brand-dark transition-all duration-200"
            /* 
               THIS IS THE FIX: 
               It pushes the content to the right so it doesn't hide behind the sidebar.
            */
            style={{
                marginLeft: 'var(--map-sidebar-width, 0px)',
                width: 'calc(100vw - var(--map-sidebar-width, 0px))',
            }}
        >
            <div className="max-w-3xl mx-auto p-8 md:p-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-black mb-2">Notifications</h1>
                    <p className="text-brand-dark/50 font-medium">Keep track of your latest route updates and alerts.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-10 text-brand-orange">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white/60 border-2 border-dashed border-brand-dark/10 rounded-3xl p-12 text-center">
                        <p className="text-brand-dark/40 font-bold">No notifications yet!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(n => (
                            <div 
                                key={n._id} 
                                className={`relative overflow-hidden p-5 rounded-2xl bg-white shadow-sm border border-brand-dark/5 transition-all hover:shadow-md
                                    ${n.status === 'sent' ? 'border-l-[6px] border-l-green-500' : 'border-l-[6px] border-l-red-500'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-lg text-brand-dark">{n.title}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark/30">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-brand-dark/70 text-sm leading-relaxed mb-2">{n.body}</p>
                                <div className="text-[10px] font-medium text-brand-dark/40 italic">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
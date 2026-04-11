import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const res = await axios.get(`${BASE_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(res.data);
        };
        fetchNotifications();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Your Notifications</h2>
            {notifications.map(n => (
                <div key={n._id} className={`p-3 mb-2 border-l-4 ${n.status === 'sent' ? 'border-green-500' : 'border-red-500'} bg-gray-100`}>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm">{n.body}</p>
                    <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

export default NotificationList;
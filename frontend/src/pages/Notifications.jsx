import { useEffect } from 'react';
import { useNotificationContext } from '../context/NotificationContext'; // Create a hook to consume context
import { useAuthContext } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import NotificationItem from '../components/notifications/NotificationItem';

const Notifications = () => {
    const { notifications, dispatch } = useNotificationContext();
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Backend expects userId in query and Token in header
                const data = await notificationService.getAll(user.id, user.token);
                dispatch({ type: 'SET_NOTIFICATIONS', payload: data });
            } catch (err) {
                console.error("Failed to fetch:", err.message);
            }
        };

        if (user) fetchNotifications();
    }, [dispatch, user]);

    const handleDelete = async (id) => {
        if (!user) return;
        try {
            await notificationService.delete(id, user.token);
            dispatch({ type: 'DELETE_NOTIFICATION', payload: { _id: id } });
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="notifications-page">
            <h2>Your Notifications</h2>
            {notifications && notifications.length === 0 && <p>No notifications found.</p>}
            {notifications && notifications.map(n => (
                <NotificationItem 
                    key={n._id} 
                    notification={n} 
                    onDelete={handleDelete} 
                />
            ))}
        </div>
    );
};

export default Notifications;
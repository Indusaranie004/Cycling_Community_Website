import { createContext, useReducer } from 'react';

export const NotificationContext = createContext();

export const notificationsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_NOTIFICATIONS':
            return { notifications: action.payload };
        case 'DELETE_NOTIFICATION':
            return {
                notifications: state.notifications.filter(n => n._id !== action.payload._id)
            };
        default:
            return state;
    }
};

export const NotificationContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notificationsReducer, {
        notifications: null
    });

    return (
        <NotificationContext.Provider value={{ ...state, dispatch }}>
            {children}
        </NotificationContext.Provider>
    );
};
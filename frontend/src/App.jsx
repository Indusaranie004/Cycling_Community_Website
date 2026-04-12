import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/shared/Navbar';
import HomePage from './pages/HomePage'
import TempInteractions from './pages/TempInteractions';
import NotificationHistory from './pages/NotificationHistory';
import RidePage from './pages/RidePage';
// Community Hub Pages
import CommunityHubPage from './pages/CommunityHubPage';
import EventsPage from './pages/EventsPage';
import ChallengesPage from './pages/ChallengesPage';

import { requestForToken, onMessageListener } from './firebase-config';
import axios from 'axios';

//Notification Handler
function NotificationHandler() {
  const { token } = useAuth();

  useEffect(() => {
    // Only attempt to register notifications if the user is logged in
    if (token) {
      const setupNotifications = async () => {
        try {
          // 1. Request permission and get the FCM token
          await requestForToken(async (fcmToken) => {
            // 2. Send the token to your backend API
            await axios.patch(
              `${process.env.REACT_APP_API_BASE_URL}/api/notifications/update-fcm`, 
              { fcmToken },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("FCM Token synced with backend");
          });

          // 3. Listen for notifications while the app is in the foreground
          onMessageListener()
            .then((payload) => {
              // You can replace this alert with a Toast library like react-hot-toast
              alert(`${payload.notification.title}\n${payload.notification.body}`);
            })
            .catch((err) => console.log('Message listener error: ', err));

        } catch (error) {
          console.error("Error setting up notifications:", error);
        }
      };

      setupNotifications();
    }
  }, [token]);

  return null; // This component doesn't render any UI
}

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to='/auth' replace />;
}

export default function App() {
  return (
    <AuthProvider>
       {/* Logic for notifications starts once AuthProvider is ready */}
      <NotificationHandler /> 

      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path='/auth' element={<AuthPage />} />
          <Route path='/map' element={<PrivateRoute><MapPage /></PrivateRoute>} />
          <Route path='/profile' element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Community Hub Routes */}
          <Route path='/community' element={<PrivateRoute><CommunityHubPage /></PrivateRoute>} />
          <Route path='/community/events' element={<PrivateRoute><EventsPage /></PrivateRoute>} />
          <Route path='/community/challenges' element={<PrivateRoute><ChallengesPage /></PrivateRoute>} />
          
          <Route path='*' element={<Navigate to='/' replace />} />
          <Route path='/' element={<HomePage />} />
          <Route path='/interactions' element={<PrivateRoute><TempInteractions /></PrivateRoute>} />
          <Route path='/notifications' element={<PrivateRoute><NotificationHistory /></PrivateRoute>} />
          <Route path='/ride' element={<PrivateRoute><RidePage /></PrivateRoute>} />
          
          

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
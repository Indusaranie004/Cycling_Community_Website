import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/shared/Navbar';
import HomePage from './pages/HomePage'

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to='/auth' replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/auth' element={<AuthPage />} />
          <Route path='/' element={<PrivateRoute><MapPage /></PrivateRoute>} />
          <Route path='/profile' element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path='*' element={<Navigate to='/' replace />} />
          <Route path='/home' element={<PrivateRoute><HomePage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
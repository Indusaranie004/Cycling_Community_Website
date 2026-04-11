import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { token } = useAuth();

  if (!token) return null;

  const navLink = (label, path) => (
    <button
      onClick={() => navigate(path)}
      className={`px-4 py-2 rounded text-sm font-medium transition-colors
        ${pathname === path
          ? 'bg-brand-sage text-brand-dark'
          : 'text-brand-cream hover:text-brand-sage'}`}
    >
      {label}
    </button>
  );

  return (
    <nav className='fixed top-0 left-0 right-0 z-50
      bg-brand-dark flex items-center
      justify-between px-6 h-14'>
      <span className='text-brand-cream font-bold text-lg tracking-wide'>
        Routify
      </span>
      <div className='flex items-center gap-2'>
        {navLink('Map', '/')}
        {navLink('Community Hub', '/community')}
        {navLink('Profile', '/profile')}
        <button
          onClick={() => { logout(); navigate('/auth'); }}
          className='ml-4 px-4 py-2 rounded text-sm font-medium
            bg-brand-red text-white hover:opacity-80 transition-opacity'
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
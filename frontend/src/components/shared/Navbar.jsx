import React, { useState, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import routifyLogo from '../../assets/RoutifyLogo.jpeg';

function IconHome({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
    </svg>
  );
}

function IconMap({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' />
    </svg>
  );
}

function IconUser({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
    </svg>
  );
}

function IconInteractions({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' />
    </svg>
  );
}

function IconMenu({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
    </svg>
  );
}

function IconLogOut({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden strokeWidth={1.5}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
      />
    </svg>
  );
}

function IconRide({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.5 8h4M7.5 13H5m3.5-5H7A2.5 2.5 0 004.5 10.5v1.25m6-1.25V9m3.5 4h1.5a2.5 2.5 0 012.5 2.5v1.25M17 19a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM7 19a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' />
    </svg>
  );
}

function IconBell({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
    </svg>
  );
}

/** Must match MapPage `marginLeft` / `width` via `--map-sidebar-width` (use px, not rem). */
const MAP_SIDEBAR_EXPANDED_PX = 260;
const MAP_SIDEBAR_COLLAPSED_PX = 72;

const NAV_ITEMS = [
  { label: 'Home', path: '/home', Icon: IconHome },
  { label: 'Map', path: '/map', Icon: IconMap },
  // { label: 'Interactions', path: '/interactions', Icon: IconInteractions },
  { label: 'Ride', path: '/ride', Icon: IconRide },
  { label: 'Notifications', path: '/notifications', Icon: IconBell },
  { label: 'Profile', path: '/profile', Icon: IconUser },
];

function pathIsActive(pathname, path) {
  if (path === '/home') return pathname === '/' || pathname === '/home';
  return pathname === path;
}

function userInitials(name, email) {
  if (name && typeof name === 'string' && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase() || '??';
    }
    return (parts[0] || '?').slice(0, 2).toUpperCase();
  }
  if (email && typeof email === 'string' && email.includes('@')) {
    const local = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'u';
    return local.slice(0, 2).toUpperCase();
  }
  return '??';
}

function userDisplayName(user) {
  const n = user?.name && String(user.name).trim();
  if (n) return n;
  const e = user?.email && String(user.email).trim();
  if (e) return e;
  return '';
}

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { token } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useLayoutEffect(() => {
    const sidebarPaths = ['/home', '/map', '/interactions', '/notifications', '/ride', '/profile']; 
if (!token || !sidebarPaths.includes(pathname)) {
      document.documentElement.style.removeProperty('--map-sidebar-width');
      return undefined;
    }
    const px = sidebarCollapsed ? MAP_SIDEBAR_COLLAPSED_PX : MAP_SIDEBAR_EXPANDED_PX;
    document.documentElement.style.setProperty('--map-sidebar-width', `${px}px`);
    return () => {
      document.documentElement.style.removeProperty('--map-sidebar-width');
    };
  }, [token, pathname, sidebarCollapsed]);

  if (!token) return null;

  const navLinkHorizontal = (label, path) => (
    <button
      type='button'
      onClick={() => navigate(path)}
      className={`px-4 py-2 rounded text-sm font-medium transition-colors
        ${pathIsActive(pathname, path)
          ? 'bg-[#FF7F11] text-white'
          : 'text-brand-cream hover:bg-white/10 hover:text-[#FF7F11]'}`}
    >
      {label}
    </button>
  );

  if (pathname === '/' || pathname === '/home' || pathname === '/map' || pathname === '/interactions' || pathname === '/notifications' || pathname === '/ride' || pathname === '/profile') {
    const wClass = sidebarCollapsed ? 'w-[72px]' : 'w-[260px]';

    return (
      <nav
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col rounded-r-2xl border-r border-white/5 bg-[#1a1a1a] text-white shadow-xl transition-[width] duration-200 ease-out ${wClass}`}
        aria-label='Main navigation'
      >
        <div className={`flex flex-shrink-0 items-center justify-between gap-2 border-b border-white/5 py-5 ${sidebarCollapsed ? 'flex-col px-2' : 'px-5'}`}>
          <img
            src={routifyLogo}
            alt='Routify'
            className={
              sidebarCollapsed
                ? 'h-12 w-auto max-w-[72px] object-contain'
                : 'h-14 w-auto max-w-[min(240px,calc(100%-2.75rem))] object-contain object-left'
            }
          />
          <button
            type='button'
            onClick={() => setSidebarCollapsed((c) => !c)}
            className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/10 hover:text-[#FF7F11]'
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <IconMenu />
          </button>
        </div>

        <div className={`mt-4 flex-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {!sidebarCollapsed && (
            <p className='mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/40'>Navigation</p>
          )}
          <ul className='flex flex-col gap-1'>
            {NAV_ITEMS.map(({ label, path, Icon }) => {
              const active = pathIsActive(pathname, path);
              return (
                <li key={path}>
                  <button
                    type='button'
                    onClick={() => navigate(path)}
                    title={sidebarCollapsed ? label : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl py-3 text-sm font-medium transition-colors
                      ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'}
                      ${active
                        ? 'bg-[#FF7F11] text-white shadow-sm'
                        : 'text-white/55 hover:bg-white/5 hover:text-[#FF7F11]'}`}
                  >
                    <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-white/60'}`}>
                      <Icon className='h-5 w-5' />
                    </span>
                    {!sidebarCollapsed && <span>{label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type='button'
            onClick={() => { logout(); navigate('/auth'); }}
            title='Log out'
            className={`group mt-3 flex w-full items-center gap-3 rounded-xl border-0 bg-transparent py-3 text-sm font-medium text-white/55 transition-colors
              hover:bg-[#FF1B1C] hover:text-white
              focus-visible:bg-[#FF1B1C] focus-visible:text-white focus-visible:outline-none
              active:bg-[#FF1B1C] active:text-white
              ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <span className='flex-shrink-0 text-white/60 group-hover:text-white'>
              <IconLogOut className='h-5 w-5' />
            </span>
            {!sidebarCollapsed && <span>Log out</span>}
          </button>
        </div>

        <div className={`mt-auto flex-shrink-0 border-t border-white/5 py-4 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <button
            type='button'
            onClick={() => navigate('/profile')}
            className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-[#FF7F11]
              ${sidebarCollapsed ? 'justify-center' : 'px-2'}`}
            title='Profile'
          >
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white/90'>
              {userInitials(user?.name, user?.email)}
            </div>
            {!sidebarCollapsed && (
              <div className='min-w-0 flex-1'>
                <p className='text-[11px] text-white/45'>user</p>
                <p className='truncate font-semibold text-white'>
                  {userDisplayName(user) || 'Loading…'}
                </p>
              </div>
            )}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className='fixed top-0 left-0 right-0 z-50
      bg-brand-dark flex items-center
      justify-between px-6 md:px-8 h-28 min-h-28'>
      <img
        src={routifyLogo}
        alt='Routify'
        className='h-[4.75rem] w-auto sm:h-[5.25rem] md:h-24 max-w-[min(520px,62vw)] object-contain object-left shrink-0'
      />
      <div className='flex items-center gap-2'>
        {navLinkHorizontal('Home', '/home')}
        {navLinkHorizontal('Map', '/map')}
        {/* {navLinkHorizontal('Interactions', '/interactions')} */}
        {navLinkHorizontal('Ride', '/ride')}
        {navLinkHorizontal('Notifications', '/notifications')}
        {navLinkHorizontal('Profile', '/profile')}
        <button
          type='button'
          onClick={() => { logout(); navigate('/auth'); }}
          className='ml-4 px-4 py-2 rounded text-sm font-medium text-brand-cream transition-colors
            hover:bg-[#FF1B1C] hover:text-white
            focus-visible:bg-[#FF1B1C] focus-visible:text-white focus-visible:outline-none
            active:bg-[#FF1B1C] active:text-white'
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
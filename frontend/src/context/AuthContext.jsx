import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext(null);

/** Ensure id/name/email are plain values (Mongo ObjectIds serialize oddly in some paths). */
function normalizeUserPayload(u) {
  if (!u || typeof u !== 'object') return null;
  const id = u.id ?? u._id;
  return {
    id: id != null ? String(id) : undefined,
    name: typeof u.name === 'string' ? u.name : '',
    email: typeof u.email === 'string' ? u.email : '',
    role: u.role,
  };
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return normalizeUserPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(readStoredUser);
  const [userId, setUserId] = useState(null);
  const userRef = useRef(user);
  userRef.current = user;

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserId(null);
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        localStorage.setItem('token', token);
      } catch {
        logout();
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUserId(null);
      setUser(null);
    }
  }, [token]);

  const login = (newToken, userPayload) => {
    setToken(newToken);
    if (userPayload != null) {
      const normalized = normalizeUserPayload(userPayload);
      setUser(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
    }
  };

  /**
   * When we have a JWT but no usable name/email in memory (e.g. old sessions), load profile once per token.
   * Depends only on `token` so failed requests do not loop; reads latest `user` via ref.
   */
  useEffect(() => {
    if (!token) return;
    const u = userRef.current;
    if (u?.name?.trim() || u?.email?.trim()) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/users/profile');
        const raw = data?.user;
        if (cancelled || !raw) return;
        const normalized = normalizeUserPayload(raw);
        if (!normalized || cancelled) return;
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
      } catch {
        /* 401 → api interceptor */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, userId, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

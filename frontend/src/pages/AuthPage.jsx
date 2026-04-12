import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export default function AuthPage() {
  const [mode, setMode] = useState('login');        // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const switchMode = (m) => { setMode(m); setError(''); };

  const submit = async () => {
    setError('');

    if (mode === 'register') {
      if (!form.name.trim()) return setError('Name is required.');
      if (form.password !== form.confirm) return setError('Passwords do not match.');
      if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/users/login' : '/api/users/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const { data } = await axios.post(`${API}${endpoint}`, payload);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
        console.error("AXIOS ERROR:", err);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (user) {
    navigate('/home');
  }
}, [user, navigate]);

  const onKey = (e) => e.key === 'Enter' && submit();

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-brand-cream text-3xl font-bold tracking-wide">EcoRide</h1>
          <p className="text-brand-sage text-sm mt-1">Your eco-friendly cycling companion</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl p-8">

          {/* Tabs */}
          <div className="flex bg-brand-dark rounded-lg p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize
                  ${mode === m
                    ? 'bg-brand-sage text-brand-dark'
                    : 'text-[#888] hover:text-brand-cream'}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-brand-sage text-xs tracking-widest mb-1.5">NAME</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handle}
                  onKeyDown={onKey}
                  className="w-full bg-brand-dark border border-[#3a3a3a] rounded-lg px-3 py-2.5
                    text-brand-cream text-sm placeholder-[#555]
                    focus:outline-none focus:border-brand-sage transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-brand-sage text-xs tracking-widest mb-1.5">EMAIL</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                onKeyDown={onKey}
                className="w-full bg-brand-dark border border-[#3a3a3a] rounded-lg px-3 py-2.5
                  text-brand-cream text-sm placeholder-[#555]
                  focus:outline-none focus:border-brand-sage transition-colors"
              />
            </div>

            <div>
              <label className="block text-brand-sage text-xs tracking-widest mb-1.5">PASSWORD</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                onKeyDown={onKey}
                className="w-full bg-brand-dark border border-[#3a3a3a] rounded-lg px-3 py-2.5
                  text-brand-cream text-sm placeholder-[#555]
                  focus:outline-none focus:border-brand-sage transition-colors"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-brand-sage text-xs tracking-widest mb-1.5">CONFIRM PASSWORD</label>
                <input
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handle}
                  onKeyDown={onKey}
                  className="w-full bg-brand-dark border border-[#3a3a3a] rounded-lg px-3 py-2.5
                    text-brand-cream text-sm placeholder-[#555]
                    focus:outline-none focus:border-brand-sage transition-colors"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-brand-red bg-[#2a1a1a] border border-[#4a2a2a] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="mt-5 w-full py-3 rounded-lg text-sm font-semibold
              bg-[#FF7F11] text-white hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>

          {/* Switch link */}
          <p className="mt-4 text-center text-sm text-[#555]">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-brand-sage hover:text-brand-cream transition-colors"
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
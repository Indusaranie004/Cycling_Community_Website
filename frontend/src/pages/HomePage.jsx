import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── Pure UI Helpers ────────────────────────────────────────────────────────
function formatDistance(metres) {
  if (!metres) return "0 km";
  return (metres / 1000).toFixed(1) + " km";
}

function formatDuration(raw) {
  if (!raw) return "N/A";
  const minutes = raw > 500 ? Math.round(raw / 60) : Math.round(raw);
  if (minutes < 60) return minutes + " min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getDifficulty(metres) {
  if (metres < 10000) return "Easy";
  if (metres < 25000) return "Medium";
  return "Hard";
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

// ─── Custom Hook for Animations ─────────────────────────────────────────────
function useCountUp(target, duration = 2000) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * ease));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [value, ref];
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function MapPreview() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ height: "420px", background: "#cde0c7" }}>
      <svg width="100%" height="100%" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="420" fill="#cce0c8" />
        <rect x="0" y="280" width="800" height="140" fill="#b8d4b2" />
        <path d="M0,210 C80,200 120,220 200,215 C280,210 320,190 400,195 C480,200 520,185 600,180 C680,175 740,185 800,180" stroke="#e8e0d0" strokeWidth="8" fill="none" opacity="0.7" />
        <path d="M80,180 C130,165 180,155 240,160 C300,165 350,175 400,168 C450,161 500,150 560,155" stroke="#FF7F11" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="80" cy="180" r="7" fill="#FF7F11" />
        <circle cx="560" cy="155" r="7" fill="#FF7F11" />
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm border border-brand-sage/40 text-brand-dark text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm">
          🔒 Log in to explore the full interactive map
        </div>
      </div>
    </div>
  );
}

function StatCounter({ value, label, suffix = "" }) {
  const [count, ref] = useCountUp(value || 0);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5">
      <span className="text-4xl md:text-5xl font-black text-white tabular-nums">
        {formatNumber(count)}{suffix}
      </span>
      <span className="text-sm text-brand-sage/70 text-center">{label}</span>
    </div>
  );
}

function RouteCard({ route, onLoginPrompt }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const difficulty = getDifficulty(route.distance);
  const diffStyles = {
    Easy: "bg-brand-sage/30 text-brand-dark",
    Medium: "bg-brand-orange/20 text-brand-dark",
    Hard: "bg-brand-red/20 text-brand-red",
  };

  const handleClick = () => {
    if (token) navigate('/map');
    else onLoginPrompt();
  };

  return (
    <button onClick={handleClick} className="group text-left w-full bg-white border border-brand-sage/30 rounded-2xl p-5 hover:border-brand-orange/50 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-bold text-brand-dark text-base leading-tight truncate mr-2">{route.name || "Untitled Route"}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${diffStyles[difficulty]}`}>{difficulty}</span>
      </div>
      <p className="text-xs text-brand-dark/45 mb-3 truncate">{route.startLocation || "Unknown"} → {route.endLocation || "Unknown"}</p>
      <div className="flex items-center gap-4 text-sm text-brand-dark/55">
        <span>⏱ {formatDuration(route.estimatedTime)}</span>
        <span>📏 {formatDistance(route.distance)}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-brand-sage/20 text-xs text-brand-orange font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        {token ? "View on map →" : "Log in to view full details →"}
      </div>
    </button>
  );
}

function LoginModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-xl font-extrabold text-brand-dark mb-2">Login Required</h3>
        <p className="text-brand-dark/55 text-sm mb-6 leading-relaxed">Create a free account to explore full route details, track your rides, and join the community.</p>
        <div className="flex flex-col gap-3">
          <a href="/register" className="bg-brand-orange text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-orange/90 transition-colors">Get Started Free</a>
          <a href="/login" className="border border-brand-dark/20 text-brand-dark font-semibold py-3 px-6 rounded-xl hover:bg-brand-cream transition-colors">Log In</a>
        </div>
        <button onClick={onClose} className="mt-5 text-xs text-brand-dark/35 hover:text-brand-dark/60">Maybe later</button>
      </div>
    </div>
  );
}

// ─── Main HomePage Component ──────────────────────────────────────────────────

export default function HomePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalDistance: 0, co2Saved: 0, activeCyclists: 0 });
  const [routes, setRoutes] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch Stats
    fetch(`${BASE_URL}/api/community-stats`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setStats(data); })
      .catch((err) => console.error("Stats fetch error:", err));

    // 2. Fetch Routes
    fetch(`${BASE_URL}/api/routes/viewRoutes`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.routes) setRoutes(data.routes.slice(0, 6));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Routes fetch error:", err);
        setLoading(false);
      });
  }, [token]);

  const features = [
    { icon: "🗺️", title: "Plan & Discover Routes", desc: "Browse community-shared paths or plan your own with elevation data." },
    { icon: "🚴", title: "Track Rides & CO₂ Saved", desc: "Log every ride automatically and watch your carbon footprint drop." },
    { icon: "⚠️", title: "Report Road Hazards", desc: "Flag potholes or dangerous junctions to keep every cyclist safer." },
    { icon: "🏆", title: "Challenges", desc: "Join weekly challenges and compete with cyclists across your city." },
  ];

  return (
    <div className="font-sans bg-brand-cream min-h-screen overflow-x-hidden">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[600px] rounded-full bg-brand-sage/25 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-sage/30 text-brand-dark text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-orange inline-block animate-pulse" />
              Eco-Friendly Cycling Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-brand-dark leading-[1.08] tracking-tight mb-5">
              Ride Green.<br /><span className="text-brand-orange">Track Impact.</span><br />Build Community.
            </h1>
            <p className="text-brand-dark/60 text-lg leading-relaxed mb-8 max-w-md">
              Discover cycling routes, measure the CO₂ you save, and report hazards in real time.
            </p>
            <div className="flex flex-wrap gap-3">
              {token ? (
                <button onClick={() => navigate('/map')} className="bg-brand-orange text-white font-extrabold px-8 py-4 rounded-xl hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/25">
                  Open Interactive Map
                </button>
              ) : (
                <>
                  <a href="/register" className="bg-brand-orange text-white font-extrabold px-8 py-4 rounded-xl hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/25">Get Started Free</a>
                  <a href="/login" className="bg-white border border-brand-dark/20 text-brand-dark font-semibold px-8 py-4 rounded-xl hover:bg-brand-cream">Log In</a>
                </>
              )}
            </div>
          </div>
          <MapPreview />
        </div>
      </section>

      {/* Community Stats */}
      <section className="bg-brand-dark py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-brand-sage/50 text-xs uppercase tracking-widest font-bold mb-12">Community Impact</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 divide-y sm:divide-y-0 sm:divide-x divide-brand-sage/20">
            <StatCounter value={stats.totalDistance || 142000} label="Total km cycled" />
            <StatCounter value={stats.co2Saved || 28000} label="kg of CO₂ saved" suffix=" kg" />
            <StatCounter value={stats.activeCyclists || 3200} label="Active cyclists" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-brand-dark tracking-tight">Everything a cyclist needs</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-brand-cream rounded-2xl p-6 hover:bg-brand-sage/30 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-extrabold text-brand-dark text-base mb-2">{f.title}</h3>
                <p className="text-sm text-brand-dark/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Routes */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-brand-cream">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <span className="inline-block bg-white text-brand-dark text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-3">Community Routes</span>
              <h2 className="text-4xl font-extrabold text-brand-dark tracking-tight">Recent public rides</h2>
            </div>
            <button onClick={() => token ? navigate('/map') : setShowLoginModal(true)} className="text-brand-orange font-semibold text-sm hover:underline">
              View all routes →
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-brand-dark/40 font-medium">Loading routes...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.length > 0 ? (
                routes.map((r) => (
                  <RouteCard key={r._id} route={r} onLoginPrompt={() => setShowLoginModal(true)} />
                ))
              ) : (
                <div className="col-span-full text-center py-10">No public routes found.</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark border-t border-white/10 py-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-brand-orange font-black text-2xl">🚴</span>
            <span className="text-white font-extrabold text-lg tracking-tight">CycleGreen</span>
          </div>
          <p className="text-brand-sage/35 text-xs">© {new Date().getFullYear()} CycleGreen. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
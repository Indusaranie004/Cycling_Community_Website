import React, { useEffect, useState, useRef } from 'react';

// ─── Mock data fallbacks ───────────────────────────────────────────────────
const MOCK_STATS = {
  totalDistance: 142389,
  co2Saved: 28477,
  activeCyclists: 3241,
};

const MOCK_ROUTES = [
  { _id: '1', name: 'Riverside Loop', distance: 12.4, estimatedTime: 48, difficulty: 'Easy' },
  { _id: '2', name: 'Highland Trail', distance: 27.8, estimatedTime: 110, difficulty: 'Hard' },
  { _id: '3', name: 'Forest Connector', distance: 8.1, estimatedTime: 32, difficulty: 'Easy' },
  { _id: '4', name: 'City Circuit', distance: 15.6, estimatedTime: 62, difficulty: 'Medium' },
  { _id: '5', name: 'Coastal Path', distance: 21.3, estimatedTime: 85, difficulty: 'Medium' },
  { _id: '6', name: 'Summit Climb', distance: 34.2, estimatedTime: 150, difficulty: 'Hard' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

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
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [value, ref];
}

// ─── Map Preview (static SVG teaser) ────────────────────────────────────────
function MapPreview() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-xl"
      style={{ height: '420px', background: '#cde0c7' }}
    >
      <svg width="100%" height="100%" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="420" fill="#cce0c8" />
        <rect x="0" y="280" width="800" height="140" fill="#b8d4b2" />
        {/* Roads */}
        <path d="M0,210 C80,200 120,220 200,215 C280,210 320,190 400,195 C480,200 520,185 600,180 C680,175 740,185 800,180" stroke="#e8e0d0" strokeWidth="8" fill="none" opacity="0.7" />
        <path d="M100,420 C150,380 200,340 240,300 C280,260 300,230 340,210" stroke="#e8e0d0" strokeWidth="6" fill="none" opacity="0.6" />
        <path d="M500,0 C520,60 510,120 530,180 C550,240 580,280 600,320 C620,360 630,400 640,420" stroke="#e8e0d0" strokeWidth="6" fill="none" opacity="0.6" />
        {/* Water */}
        <path d="M0,310 C60,305 80,315 150,308 C220,301 240,312 300,306 C360,300 380,308 440,303" stroke="#a0c4e8" strokeWidth="3" fill="none" />
        {/* Route A - orange */}
        <path d="M80,180 C130,165 180,155 240,160 C300,165 350,175 400,168 C450,161 500,150 560,155" stroke="#FF7F11" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="80" cy="180" r="7" fill="#FF7F11" />
        <circle cx="560" cy="155" r="7" fill="#FF7F11" />
        {/* Route B - sage */}
        <path d="M200,280 C230,255 270,235 310,225 C350,215 390,210 430,220 C470,230 490,250 520,260" stroke="#ACBFA4" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="200" cy="280" r="6" fill="#ACBFA4" />
        <circle cx="520" cy="260" r="6" fill="#ACBFA4" />
        {/* Route C - dashed */}
        <path d="M350,320 C380,295 420,270 460,258 C500,246 540,248 570,255" stroke="#262626" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 3" opacity="0.4" />
        {/* Trees */}
        {[60,90,120,150,640,670,700,720].map((x, i) => (
          <circle key={i} cx={x} cy={i < 4 ? 260 + i * 12 : 80 + i * 8} r="5" fill="#6a9e5a" opacity="0.6" />
        ))}
      </svg>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-cream/70 via-transparent to-transparent pointer-events-none" />
      {/* Lock banner */}
      <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm border border-brand-sage/40 text-brand-dark text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm">
          🔒 Log in to explore the full interactive map
        </div>
      </div>
      {/* Legend */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white/75 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-brand-dark">
          <span className="w-4 h-0.5 bg-brand-orange inline-block rounded" /> Riverside Loop
        </div>
        <div className="flex items-center gap-2 bg-white/75 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-brand-dark">
          <span className="w-4 h-0.5 bg-brand-sage inline-block rounded" /> Highland Trail
        </div>
      </div>
    </div>
  );
}

// ─── Stat Counter ────────────────────────────────────────────────────────────
function StatCounter({ value, label, suffix = '' }) {
  const [count, ref] = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5">
      <span className="text-4xl md:text-5xl font-black text-white tabular-nums">
        {formatNumber(count)}{suffix}
      </span>
      <span className="text-sm text-brand-sage/70 text-center">{label}</span>
    </div>
  );
}

// ─── Route Card ──────────────────────────────────────────────────────────────
function RouteCard({ route, onLoginPrompt }) {
  const diffStyles = {
    Easy: 'bg-brand-sage/30 text-brand-dark',
    Medium: 'bg-brand-orange/20 text-brand-dark',
    Hard: 'bg-brand-red/20 text-brand-red',
  };
  const style = diffStyles[route.difficulty] || 'bg-gray-100 text-gray-600';

  return (
    <button
      onClick={onLoginPrompt}
      className="group text-left w-full bg-white border border-brand-sage/30 rounded-2xl p-5 hover:border-brand-orange/50 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="font-bold text-brand-dark text-base leading-tight">{route.name}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${style}`}>
          {route.difficulty}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-brand-dark/55">
        <span>⏱ {route.estimatedTime} min</span>
        <span>📏 {route.distance} km</span>
      </div>
      <div className="mt-3 pt-3 border-t border-brand-sage/20 text-xs text-brand-orange font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        Log in to view full details →
      </div>
    </button>
  );
}

// ─── Login Modal ─────────────────────────────────────────────────────────────
function LoginModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-xl font-extrabold text-brand-dark mb-2">Login Required</h3>
        <p className="text-brand-dark/55 text-sm mb-6 leading-relaxed">
          Create a free account to explore full route details, track your rides, and join the community.
        </p>
        <div className="flex flex-col gap-3">
          <a href="/register" className="bg-brand-orange text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-orange/90 transition-colors">
            Get Started Free
          </a>
          <a href="/login" className="border border-brand-dark/20 text-brand-dark font-semibold py-3 px-6 rounded-xl hover:bg-brand-cream transition-colors">
            Log In
          </a>
        </div>
        <button onClick={onClose} className="mt-5 text-xs text-brand-dark/35 hover:text-brand-dark/60 transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ─── Main HomePage ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [routes, setRoutes] = useState(MOCK_ROUTES);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetch('/api/community-stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});

    fetch('/api/routes/viewRoutes')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length) setRoutes(d.slice(0, 6)); })
      .catch(() => {});
  }, []);

  const features = [
    {
      icon: '🗺️',
      title: 'Plan & Discover Routes',
      desc: 'Browse community-shared paths or plan your own with elevation data and turn-by-turn guidance.',
    },
    {
      icon: '🚴',
      title: 'Track Rides & CO₂ Saved',
      desc: 'Log every ride automatically and watch your personal carbon footprint drop in real time.',
    },
    {
      icon: '⚠️',
      title: 'Report Road Hazards',
      desc: 'Flag potholes, dangerous junctions, or poor lighting to keep every cyclist safer.',
    },
    {
      icon: '🏆',
      title: 'Challenges & Leaderboards',
      desc: 'Join weekly challenges, earn badges, and compete with cyclists across your city.',
    },
  ];

  const steps = [
    {
      n: '01',
      title: 'Register & set up your profile',
      desc: 'Create your account in under a minute. Set your home city and preferred cycling style.',
    },
    {
      n: '02',
      title: 'Find or plan a route on the map',
      desc: 'Browse public routes from the community or design your own from scratch with the planner.',
    },
    {
      n: '03',
      title: 'Ride, track & earn community points',
      desc: 'Hit the road. Earn points for every km, collect badges, and climb the leaderboard.',
    },
  ];

  return (
    <div className="font-sans bg-brand-cream min-h-screen overflow-x-hidden">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[700px] h-[600px] rounded-full bg-brand-sage/25 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-orange/10 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-sage/30 text-brand-dark text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-orange inline-block animate-pulse" />
              Eco-Friendly Cycling Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-brand-dark leading-[1.08] tracking-tight mb-5">
              Ride Green.<br />
              <span className="text-brand-orange">Track Impact.</span><br />
              Build Community.
            </h1>
            <p className="text-brand-dark/60 text-lg leading-relaxed mb-8 max-w-md">
              Discover cycling routes, measure the CO₂ you save on every ride, report hazards in real time, and compete with fellow cyclists — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/register"
                className="bg-brand-orange text-white font-extrabold text-base px-8 py-4 rounded-xl hover:bg-brand-orange/90 active:scale-95 transition-all shadow-lg shadow-brand-orange/25"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="bg-white border border-brand-dark/20 text-brand-dark font-semibold text-base px-8 py-4 rounded-xl hover:bg-brand-cream transition-all"
              >
                Log In
              </a>
            </div>
          </div>

          {/* Right map preview */}
          <div>
            <MapPreview />
          </div>
        </div>
      </section>

      {/* ── COMMUNITY STATS ──────────────────────────────────────────── */}
      <section className="bg-brand-dark py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-brand-sage/50 text-xs uppercase tracking-widest font-bold mb-12">
            Community in numbers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 divide-y sm:divide-y-0 sm:divide-x divide-brand-sage/20">
            <div className="flex flex-col items-center pb-10 sm:pb-0">
              <StatCounter value={stats.totalDistance} label="Total km cycled by the community" />
            </div>
            <div className="flex flex-col items-center pt-10 sm:pt-0 pb-10 sm:pb-0">
              <StatCounter value={stats.co2Saved} label="kg of CO₂ saved" suffix=" kg" />
            </div>
            <div className="flex flex-col items-center pt-10 sm:pt-0">
              <StatCounter value={stats.activeCyclists} label="Active cyclists" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-brand-cream text-brand-dark text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              What we offer
            </span>
            <h2 className="text-4xl font-extrabold text-brand-dark tracking-tight">
              Everything a cyclist needs
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-brand-cream rounded-2xl p-6 hover:bg-brand-sage/30 transition-colors duration-200"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-extrabold text-brand-dark text-base mb-2 leading-tight">{f.title}</h3>
                <p className="text-sm text-brand-dark/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-brand-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-white text-brand-dark text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              Simple as 1-2-3
            </span>
            <h2 className="text-4xl font-extrabold text-brand-dark tracking-tight">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-orange font-black text-xl">{s.n}</span>
                </div>
                <h3 className="font-extrabold text-brand-dark text-lg leading-snug">{s.title}</h3>
                <p className="text-sm text-brand-dark/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT PUBLIC ROUTES ─────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <span className="inline-block bg-brand-cream text-brand-dark text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-3">
                Community routes
              </span>
              <h2 className="text-4xl font-extrabold text-brand-dark tracking-tight">Recent public rides</h2>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-brand-orange font-semibold text-sm hover:underline whitespace-nowrap"
            >
              View all routes →
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map(r => (
              <RouteCard key={r._id} route={r} onLoginPrompt={() => setShowLoginModal(true)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-dark text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-brand-sage/50 text-xs uppercase tracking-widest font-bold mb-5">Start for free</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Join thousands of eco-cyclists today
          </h2>
          <p className="text-brand-sage/65 text-lg mb-8">
            No credit card required. Start tracking your rides and reducing your carbon footprint right now.
          </p>
          <a
            href="/register"
            className="inline-block bg-brand-orange text-white font-extrabold text-lg px-10 py-4 rounded-xl hover:bg-brand-orange/90 active:scale-95 transition-all shadow-2xl shadow-brand-orange/20"
          >
            Create your free account
          </a>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-brand-dark border-t border-white/10 py-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-brand-orange font-black text-2xl">🚴</span>
            <span className="text-white font-extrabold text-lg tracking-tight">Routify</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-brand-sage/65">
            <a href="/about" className="hover:text-white transition-colors">About</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </nav>
          <p className="text-brand-sage/35 text-xs">
            © {new Date().getFullYear()} Routify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
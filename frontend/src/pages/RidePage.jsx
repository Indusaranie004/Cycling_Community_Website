import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as routeSvc from '../services/routeService';
import * as rideSvc from '../services/rideService';

// ─── Constants ───────────────────────────────────────────────────────────────
const EARTH_RADIUS_KM = 6371;
const GPS_MIN_ACCURACY_M = 30;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function haversineKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtMins(mins) {
  if (!mins) return '0 min';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m} min`;
}

function fmtDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

function fmtSpeed(kmh) {
  return `${Number(kmh).toFixed(1)} km/h`;
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function StatPill({ label, value, accent = false }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-3
      ${accent ? 'bg-[#FF7F11]/15 border border-[#FF7F11]/30' : 'bg-[#1a1a1a]/80 border border-white/10 backdrop-blur-md'}`}>
      <span className={`text-2xl font-black tabular-nums tracking-tight
        ${accent ? 'text-[#FF7F11]' : 'text-brand-cream'}`}>
        {value}
      </span>
      <span className='text-[11px] font-semibold text-brand-sage/70 uppercase tracking-widest mt-0.5'>
        {label}
      </span>
    </div>
  );
}

function EcoResultCard({ impact }) {
  if (!impact) return null;
  const items = [
    { icon: '🌱', label: 'CO₂ Saved',  value: `${impact.co2_saved_kg} kg`,      color: 'text-green-400'  },
    { icon: '⛽', label: 'Fuel Saved',  value: `${impact.fuel_saved_liters} L`,  color: 'text-[#FF7F11]'  },
    { icon: '🔥', label: 'Calories',   value: `${impact.calories_burned} kcal`, color: 'text-brand-red'  },
    { icon: '⭐', label: 'Eco Score',  value: `${impact.eco_score} pts`,        color: 'text-yellow-400' },
  ];
  return (
    <div className='grid grid-cols-2 gap-3'>
      {items.map(item => (
        <div key={item.label}
          className='bg-[#1a1a1a]/80 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-1'>
          <span className='text-2xl'>{item.icon}</span>
          <span className={`text-xl font-black ${item.color}`}>{item.value}</span>
          <span className='text-xs text-brand-sage/60 uppercase tracking-widest'>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function RouteCard({ route, selected, onSelect }) {
  const distKm = (route.distance / 1000).toFixed(1);
  const timeMin = route.estimatedTime > 500
    ? Math.round(route.estimatedTime / 60)
    : Math.round(route.estimatedTime);
  return (
    <button
      onClick={() => onSelect(route)}
      className={`w-full text-left rounded-2xl p-4 border transition-all duration-150 backdrop-blur-md
        ${selected
          ? 'bg-brand-sage/20 border-brand-sage shadow-inner'
          : 'bg-[#1a1a1a]/80 border-white/10 hover:bg-white/10 hover:border-brand-sage/40'}`}
    >
      <div className='flex items-start justify-between gap-2'>
        <p className={`text-sm font-bold truncate ${selected ? 'text-brand-sage' : 'text-brand-cream'}`}>
          {route.name}
        </p>
        {selected && (
          <span className='flex-shrink-0 w-5 h-5 rounded-full bg-brand-sage flex items-center justify-center'>
            <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
              <path d='M1 4L3.5 6.5L9 1' stroke='#262626' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/>
            </svg>
          </span>
        )}
      </div>
      <p className='text-xs text-brand-sage/50 truncate mt-0.5'>
        {route.startLocation} → {route.endLocation}
      </p>
      <div className='flex gap-3 mt-2 text-xs text-brand-cream/50'>
        <span>{distKm} km</span>
        <span>·</span>
        <span>{timeMin} min est.</span>
      </div>
    </button>
  );
}

// ─── Ride Detail / Edit / Delete Modal ───────────────────────────────────────
function RideModal({ rideId, onClose, onDeleted, onUpdated }) {
  const [ride, setRide]       = useState(null);
  const [impact, setImpact]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [isEditing, setIsEditing]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [draft, setDraft] = useState({
    distance_km: '', duration_minutes: '', start_time: '', end_time: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [rideRes, impactRes] = await Promise.all([
          rideSvc.getRideById(rideId),
          rideSvc.getImpactByRideId(rideId),
        ]);
        setRide(rideRes.data);
        setImpact(impactRes.data);
        setDraft({
          distance_km:      rideRes.data.distance_km,
          duration_minutes: rideRes.data.duration_minutes,
          start_time:       rideRes.data.start_time || '',
          end_time:         rideRes.data.end_time   || '',
        });
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load ride details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rideId]);

  const calcSpeed = draft.distance_km && draft.duration_minutes
    ? parseFloat(draft.distance_km) / (parseFloat(draft.duration_minutes) / 60)
    : 0;

  const handleSave = async () => {
    if (calcSpeed > 50) return;
    setSaving(true);
    setError('');
    try {
      const res = await rideSvc.updateRide(rideId, {
        distance_km:      parseFloat(draft.distance_km),
        duration_minutes: parseFloat(draft.duration_minutes),
        start_time:       draft.start_time,
        end_time:         draft.end_time,
      });
      setRide(res.data.ride);
      // Refresh eco impact since backend recalculates it on update
      const impactRes = await rideSvc.getImpactByRideId(rideId);
      setImpact(impactRes.data);
      setIsEditing(false);
      onUpdated && onUpdated(res.data.ride);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update ride.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try {
      await rideSvc.deleteRide(rideId);
      onDeleted && onDeleted(rideId);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete ride.');
      setDeleting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
      onClick={onClose}
    >
      <div
        className='w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl
          shadow-2xl max-h-[90vh] overflow-y-auto'
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className='flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 sticky top-0 bg-[#1a1a1a] z-10'>
          <h2 className='text-brand-cream font-black text-lg'>
            {isEditing ? 'Edit Ride' : 'Ride Details'}
          </h2>
          <button onClick={onClose} className='text-brand-sage/50 hover:text-brand-cream transition-colors text-2xl leading-none'>×</button>
        </div>

        <div className='p-6 space-y-5'>
          {/* Loading */}
          {loading && (
            <div className='flex items-center justify-center py-10 text-brand-sage/40 text-sm gap-2'>
              <svg className='w-4 h-4 animate-spin' viewBox='0 0 24 24' fill='none'>
                <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' strokeDasharray='40 20'/>
              </svg>
              Loading…
            </div>
          )}

          {/* Error */}
          {error && (
            <p className='text-brand-red text-xs bg-brand-red/10 border border-brand-red/20 rounded-xl px-3 py-2'>
              {error}
            </p>
          )}

          {!loading && ride && (
            <>
              <p className='text-brand-sage/50 text-xs font-semibold uppercase tracking-widest'>
                {fmtDate(ride.ride_date || ride.createdAt)}
              </p>

              {/* ── EDIT FORM ── */}
              {isEditing ? (
                <div className='space-y-4'>
                  {[
                    { key: 'distance_km',      label: 'Distance (km)',     type: 'number', min: 0.1,  step: 0.01 },
                    { key: 'duration_minutes',  label: 'Duration (minutes)', type: 'number', min: 1,    step: 1    },
                    { key: 'start_time',        label: 'Start Time',         type: 'text',   placeholder: 'e.g. 08:30 AM' },
                    { key: 'end_time',          label: 'End Time',           type: 'text',   placeholder: 'e.g. 09:15 AM' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className='block text-brand-sage text-xs uppercase tracking-widest mb-1.5'>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        min={field.min}
                        step={field.step}
                        placeholder={field.placeholder}
                        value={draft[field.key]}
                        onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                        className='w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5
                          text-brand-cream text-sm focus:outline-none focus:border-brand-sage transition-colors'
                      />
                    </div>
                  ))}

                  {/* Speed preview */}
                  {calcSpeed > 0 && (
                    <div className='bg-white/5 rounded-xl px-4 py-3 border border-white/10'>
                      <p className='text-brand-sage/60 text-xs'>
                        Calculated avg speed:{' '}
                        <span className='text-brand-cream font-bold'>{fmtSpeed(calcSpeed)}</span>
                        {calcSpeed > 50 && (
                          <span className='text-brand-red ml-2'>⚠ Exceeds 50 km/h limit</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className='flex gap-3 pt-1'>
                    <button
                      onClick={handleSave}
                      disabled={saving || calcSpeed > 50}
                      className='flex-1 py-3 rounded-2xl text-sm font-bold bg-[#FF7F11] text-white
                        hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed'
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setError(''); setConfirmDel(false); }}
                      className='flex-1 py-3 rounded-2xl text-sm font-bold bg-white/10 text-brand-cream
                        border border-white/15 hover:bg-white/20 transition-colors'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <>
                  {/* Stats grid */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-white/5 rounded-2xl p-4 border border-white/10 text-center'>
                      <p className='text-2xl font-black text-brand-cream'>{fmtDistance(ride.distance_km)}</p>
                      <p className='text-xs text-brand-sage/50 uppercase tracking-widest mt-1'>Distance</p>
                    </div>
                    <div className='bg-white/5 rounded-2xl p-4 border border-white/10 text-center'>
                      <p className='text-2xl font-black text-brand-cream'>{fmtMins(ride.duration_minutes)}</p>
                      <p className='text-xs text-brand-sage/50 uppercase tracking-widest mt-1'>Duration</p>
                    </div>
                    <div className='bg-white/5 rounded-2xl p-4 border border-white/10 text-center'>
                      <p className='text-2xl font-black text-brand-cream'>{fmtSpeed(ride.avg_speed || 0)}</p>
                      <p className='text-xs text-brand-sage/50 uppercase tracking-widest mt-1'>Avg Speed</p>
                    </div>
                    <div className='bg-white/5 rounded-2xl p-4 border border-white/10 text-center'>
                      <p className='text-base font-black text-brand-cream leading-tight'>
                        {ride.start_time || '—'}{ride.end_time ? ` → ${ride.end_time}` : ''}
                      </p>
                      <p className='text-xs text-brand-sage/50 uppercase tracking-widest mt-1'>Time</p>
                    </div>
                  </div>

                  {/* Route badge */}
                  {ride.route_id && (
                    <div className='flex items-center gap-2 bg-brand-sage/10 border border-brand-sage/20 rounded-xl px-3 py-2'>
                      <span className='w-2 h-2 rounded-full bg-brand-sage flex-shrink-0' />
                      <span className='text-brand-sage text-xs font-semibold truncate'>
                        {ride.route_id?.name || 'Route'}
                      </span>
                    </div>
                  )}

                  {/* Eco Impact */}
                  <div>
                    <p className='text-brand-sage text-xs font-bold uppercase tracking-widest mb-3'>🌿 Eco Impact</p>
                    <EcoResultCard impact={impact} />
                  </div>

                  {/* Actions */}
                  <div className='flex gap-3 pt-1'>
                    <button
                      onClick={() => { setIsEditing(true); setConfirmDel(false); setError(''); }}
                      className='flex-1 py-3 rounded-2xl text-sm font-bold bg-white/10 text-brand-cream
                        border border-white/15 hover:bg-white/20 transition-colors'
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all
                        ${confirmDel
                          ? 'bg-brand-red text-white hover:opacity-80'
                          : 'bg-white/5 text-brand-red border border-brand-red/30 hover:bg-brand-red/10'}`}
                    >
                      {deleting ? 'Deleting…' : confirmDel ? 'Confirm Delete?' : '🗑 Delete'}
                    </button>
                  </div>
                  {confirmDel && (
                    <p className='text-brand-sage/40 text-xs text-center -mt-2'>
                      This permanently removes the ride and its eco impact data.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ride History Item ────────────────────────────────────────────────────────
function RideHistoryItem({ ride, onOpen }) {
  return (
    <button
      onClick={() => onOpen(ride._id)}
      className='w-full text-left bg-[#1a1a1a]/80 border border-white/10 backdrop-blur-md
        rounded-2xl p-4 hover:bg-white/5 hover:border-brand-sage/30 transition-all group'
    >
      <div className='flex items-center justify-between gap-2 mb-2'>
        <p className='text-brand-cream font-bold text-sm truncate'>
          {ride.route_id?.name || 'Free Ride'}
        </p>
        <span className='text-brand-sage/40 text-xs flex-shrink-0'>
          {fmtDate(ride.ride_date || ride.createdAt)}
        </span>
      </div>
      <div className='flex gap-4 text-xs text-brand-sage/60'>
        <span>📏 {fmtDistance(ride.distance_km)}</span>
        <span>⏱ {fmtMins(ride.duration_minutes)}</span>
        <span>⚡ {fmtSpeed(ride.avg_speed || 0)}</span>
      </div>
      <p className='text-[#FF7F11] text-xs font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity'>
        Tap to view details →
      </p>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RidePage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('tracker');

  // Route selection
  const [myRoutes, setMyRoutes]         = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routesLoading, setRoutesLoading] = useState(true);

  // Ride state
  const [rideState, setRideState]         = useState('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm]         = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [startTime, setStartTime]           = useState(null);
  const [gpsError, setGpsError]             = useState('');
  const [rideResult, setRideResult]         = useState(null);

  // History
  const [history, setHistory]           = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError]     = useState('');

  // Modal
  const [modalRideId, setModalRideId] = useState(null);

  const timerRef   = useRef(null);
  const watchIdRef = useRef(null);
  const lastPosRef = useRef(null);

  // Load my routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await routeSvc.getUserRoutes(user?.id);
        setMyRoutes(res.data.routes || []);
      } catch { } finally { setRoutesLoading(false); }
    };
    if (user?.id) fetchRoutes();
  }, [user]);

  // Load history when tab opens
  useEffect(() => {
    if (activeTab !== 'history') return;
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError('');
      try {
        const res = await rideSvc.getMyRides();
        setHistory(res.data || []);
      } catch {
        setHistoryError('Failed to load ride history.');
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [activeTab]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Timer
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setElapsedSeconds(p => p + 1), 1000);
  }, []);
  const pauseTimer = useCallback(() => clearInterval(timerRef.current), []);

  // GPS
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsError('Geolocation not supported.'); return; }
    setGpsError('');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy > GPS_MIN_ACCURACY_M) return;
        const cur = [pos.coords.longitude, pos.coords.latitude];
        if (lastPosRef.current) {
          const d = haversineKm(lastPosRef.current, cur);
          if (d < 0.5) setDistanceKm(p => p + d);
        }
        lastPosRef.current = cur;
        if (pos.coords.speed != null && pos.coords.speed >= 0) setCurrentSpeedKmh(pos.coords.speed * 3.6);
      },
      (err) => { if (err.code === err.PERMISSION_DENIED) setGpsError('Location permission denied.'); },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }, []);

  const stopGPS = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    lastPosRef.current = null;
    setCurrentSpeedKmh(0);
  }, []);

  // Start
  const handleStart = useCallback(() => {
    setStartTime(new Date());
    setElapsedSeconds(0);
    setDistanceKm(0);
    setCurrentSpeedKmh(0);
    setRideResult(null);
    setRideState('active');
    startTimer();
    startGPS();
  }, [startTimer, startGPS]);

  // Pause / Resume
  const handlePause  = useCallback(() => { pauseTimer(); stopGPS(); setRideState('paused'); }, [pauseTimer, stopGPS]);
  const handleResume = useCallback(() => { setRideState('active'); startTimer(); startGPS(); }, [startTimer, startGPS]);

  // End
  const handleEnd = useCallback(async () => {
    pauseTimer();
    stopGPS();
    setRideState('saving');

    let finalDistKm = distanceKm;
    if (finalDistKm < 0.05 && selectedRoute) finalDistKm = parseFloat((selectedRoute.distance / 1000).toFixed(3));
    if (finalDistKm < 0.05) finalDistKm = 0.1;

    let duration_minutes = Math.max(1, Math.round(elapsedSeconds / 60));
    if (finalDistKm / (duration_minutes / 60) > 50) {
      duration_minutes = Math.ceil((finalDistKm / 25) * 60);
    }

    const payload = {
      route_id:         selectedRoute?._id || null,
      distance_km:      finalDistKm,
      duration_minutes,
      start_time:       startTime?.toISOString() || new Date().toISOString(),
      end_time:         new Date().toISOString(),
    };

    try {
      const res = await rideSvc.createRide(payload);
      setRideResult(res.data);
      setRideState('finished');
      setHistory(prev => [res.data.ride, ...prev]);
    } catch (err) {
      setGpsError(err.response?.data?.message || 'Failed to save ride.');
      setRideState('error');
    }
  }, [pauseTimer, stopGPS, elapsedSeconds, distanceKm, selectedRoute, startTime]);

  // Reset
  const handleReset = useCallback(() => {
    clearInterval(timerRef.current);
    stopGPS();
    setRideState('idle');
    setElapsedSeconds(0);
    setDistanceKm(0);
    setCurrentSpeedKmh(0);
    setStartTime(null);
    setRideResult(null);
    setGpsError('');
  }, [stopGPS]);

  // History callbacks
  const handleRideDeleted = useCallback((id) => {
    setHistory(prev => prev.filter(r => r._id !== id));
  }, []);
  const handleRideUpdated = useCallback((updated) => {
    setHistory(prev => prev.map(r => r._id === updated._id ? updated : r));
  }, []);

  const avgSpeedKmh = elapsedSeconds > 0 ? (distanceKm / (elapsedSeconds / 3600)) : 0;
  const isIdle     = rideState === 'idle';
  const isActive   = rideState === 'active';
  const isPaused   = rideState === 'paused';
  const isSaving   = rideState === 'saving';
  const isFinished = rideState === 'finished';
  const isError    = rideState === 'error';
  const isRunning  = isActive || isPaused;
  const showTabs   = isIdle || isFinished || isError;

  return (
    <div className='relative h-screen max-h-screen w-full bg-brand-dark overflow-hidden transition-all duration-200 ease-out'>
      {/* ── MAP BACKGROUND ── */}
      <div className='absolute inset-0 z-0 opacity-30 pointer-events-none'>
        <Map
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          initialViewState={{ longitude: 79.86, latitude: 6.92, zoom: 13 }}
          mapStyle='mapbox://styles/mapbox/dark-v11'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-transparent to-brand-dark/80' />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className='relative z-10 pt-24 px-4 pb-10 h-full overflow-y-auto'>
        <div className='max-w-lg mx-auto'>

          {/* Page header */}
          <div className='flex items-center gap-3 mb-5 pt-2'>
            <span className='text-2xl'>🚴</span>
            <h1 className='text-brand-cream text-2xl font-black tracking-tight flex-1'>
              Ride Tracker
            </h1>
            {isActive && (
              <span className='flex items-center gap-1.5 bg-green-500/20 border border-green-500/30
                text-green-400 text-xs font-bold px-3 py-1 rounded-full'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse' />
                LIVE
              </span>
            )}
            {isPaused && (
              <span className='bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full'>
                PAUSED
              </span>
            )}
          </div>

          {/* Tabs — hidden during active ride so they don't distract */}
          {showTabs && (
            <div className='flex bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-1 mb-4'>
              {[
                { key: 'tracker', label: '🚴 Tracker' },
                { key: 'history', label: '📋 My Rides' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors
                    ${activeTab === tab.key
                      ? 'bg-[#FF7F11] text-white shadow-sm'
                      : 'text-brand-sage/60 hover:text-brand-cream'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* ══════════════ TRACKER TAB ══════════════ */}
          {(activeTab === 'tracker' || isRunning || isSaving) && (
            <>
              {/* Live Tracker */}
              {(isRunning || isSaving || isError) && (
                <div className='bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-6 mb-4'>
                  <div className='text-center mb-6'>
                    <div className='text-6xl font-black text-brand-cream tabular-nums tracking-tighter font-mono'>
                      {fmtDuration(elapsedSeconds)}
                    </div>
                    <p className='text-brand-sage/50 text-xs uppercase tracking-widest mt-1'>Elapsed Time</p>
                  </div>

                  <div className='grid grid-cols-3 gap-3 mb-6'>
                    <StatPill label='Distance' value={fmtDistance(distanceKm)} accent={distanceKm > 0.1} />
                    <StatPill label='Speed'    value={fmtSpeed(isActive ? currentSpeedKmh : 0)} />
                    <StatPill label='Avg Speed' value={fmtSpeed(avgSpeedKmh)} />
                  </div>

                  {selectedRoute && (
                    <div className='flex items-center gap-2 bg-brand-sage/10 border border-brand-sage/20 rounded-xl px-3 py-2 mb-5'>
                      <span className='w-2 h-2 rounded-full bg-brand-sage flex-shrink-0' />
                      <span className='text-brand-sage text-xs font-semibold truncate'>{selectedRoute.name}</span>
                      <span className='text-brand-sage/40 text-xs ml-auto flex-shrink-0'>
                        {(selectedRoute.distance / 1000).toFixed(1)} km
                      </span>
                    </div>
                  )}

                  {gpsError && (
                    <p className='text-[#FF7F11] text-xs bg-[#FF7F11]/10 border border-[#FF7F11]/20 rounded-xl px-3 py-2 mb-4'>
                      ⚠ {gpsError}
                    </p>
                  )}

                  <div className='flex gap-3'>
                    {isActive && (
                      <>
                        <button onClick={handlePause} className='flex-1 py-3 rounded-2xl text-sm font-bold bg-white/10 text-brand-cream border border-white/15 hover:bg-white/20 transition-colors'>⏸ Pause</button>
                        <button onClick={handleEnd}   className='flex-1 py-3 rounded-2xl text-sm font-bold bg-brand-red text-white hover:opacity-90 transition-opacity'>⏹ End Ride</button>
                      </>
                    )}
                    {isPaused && (
                      <>
                        <button onClick={handleResume} className='flex-1 py-3 rounded-2xl text-sm font-bold bg-brand-sage text-brand-dark hover:opacity-90 transition-opacity'>▶ Resume</button>
                        <button onClick={handleEnd}    className='flex-1 py-3 rounded-2xl text-sm font-bold bg-brand-red text-white hover:opacity-90 transition-opacity'>⏹ End Ride</button>
                        <button onClick={handleReset}  className='px-4 py-3 rounded-2xl text-sm font-bold bg-white/5 text-brand-sage/60 border border-white/10 hover:bg-white/10 transition-colors' title='Discard'>✕</button>
                      </>
                    )}
                    {isSaving && (
                      <div className='flex-1 flex items-center justify-center gap-2 py-3 text-brand-sage/60 text-sm'>
                        <svg className='w-4 h-4 animate-spin' viewBox='0 0 24 24' fill='none'>
                          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' strokeDasharray='40 20'/>
                        </svg>
                        Saving ride…
                      </div>
                    )}
                    {isError && (
                      <button onClick={handleReset} className='flex-1 py-3 rounded-2xl text-sm font-bold bg-white/10 text-brand-cream border border-white/15 hover:bg-white/20 transition-colors'>Start Over</button>
                    )}
                  </div>
                </div>
              )}

              {/* Post-ride summary */}
              {isFinished && rideResult && activeTab === 'tracker' && (
                <div className='bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-6 mb-4'>
                  <div className='flex items-center gap-3 mb-5'>
                    <div className='w-10 h-10 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl'>🏁</div>
                    <div>
                      <p className='text-brand-cream font-black text-base'>Ride Complete!</p>
                      <p className='text-brand-sage/50 text-xs'>
                        {startTime ? startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''} · {fmtDuration(elapsedSeconds)}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3 mb-5'>
                    <div className='bg-white/5 rounded-2xl p-4 text-center border border-white/10'>
                      <p className='text-2xl font-black text-brand-cream'>{fmtDistance(distanceKm > 0.05 ? distanceKm : (rideResult.ride?.distance_km || 0))}</p>
                      <p className='text-xs text-brand-sage/50 uppercase tracking-widest mt-1'>Distance</p>
                    </div>
                    <div className='bg-white/5 rounded-2xl p-4 text-center border border-white/10'>
                      <p className='text-2xl font-black text-brand-cream'>{fmtSpeed(rideResult.ride?.avg_speed || 0)}</p>
                      <p className='text-xs text-brand-sage/50 uppercase tracking-widest mt-1'>Avg Speed</p>
                    </div>
                  </div>

                  <div className='mb-5'>
                    <p className='text-brand-sage text-xs font-bold uppercase tracking-widest mb-3'>🌿 Your Eco Impact</p>
                    <EcoResultCard impact={rideResult.impact} />
                  </div>

                  <div className='flex gap-3'>
                    <button onClick={handleReset} className='flex-1 py-3 rounded-2xl text-sm font-bold bg-[#FF7F11] text-white hover:opacity-90 transition-opacity'>
                      Start New Ride
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className='flex-1 py-3 rounded-2xl text-sm font-bold bg-white/10 text-brand-cream border border-white/15 hover:bg-white/20 transition-colors'
                    >
                      View History
                    </button>
                  </div>
                </div>
              )}

              {/* Route selector (idle only) */}
              {isIdle && activeTab === 'tracker' && (
                <>
                  <div className='bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-5 mb-4'>
                    <p className='text-brand-sage text-xs font-bold uppercase tracking-widest mb-3'>
                      Select a Route <span className='text-brand-sage/40 normal-case font-normal'>(optional)</span>
                    </p>
                    {routesLoading ? (
                      <div className='text-brand-sage/40 text-sm text-center py-4'>Loading your routes…</div>
                    ) : myRoutes.length === 0 ? (
                      <div className='text-center py-6'>
                        <p className='text-brand-sage/40 text-sm mb-2'>No routes yet.</p>
                        <a href='/map' className='text-[#FF7F11] text-sm font-semibold hover:underline'>Create a route on the map →</a>
                      </div>
                    ) : (
                      <div className='space-y-2 max-h-56 overflow-y-auto pr-1'>
                        <button
                          onClick={() => setSelectedRoute(null)}
                          className={`w-full text-left rounded-2xl p-4 border transition-all backdrop-blur-md
                            ${!selectedRoute ? 'bg-brand-sage/20 border-brand-sage' : 'bg-[#1a1a1a]/80 border-white/10 hover:bg-white/10'}`}
                        >
                          <p className={`text-sm font-bold ${!selectedRoute ? 'text-brand-sage' : 'text-brand-cream/60'}`}>Free Ride</p>
                          <p className='text-xs text-brand-sage/40 mt-0.5'>Ride without a predefined route</p>
                        </button>
                        {myRoutes.map(route => (
                          <RouteCard key={route._id} route={route} selected={selectedRoute?._id === route._id} onSelect={setSelectedRoute} />
                        ))}
                      </div>
                    )}
                  </div>

                  {gpsError && (
                    <p className='text-[#FF7F11] text-xs bg-[#FF7F11]/10 border border-[#FF7F11]/20 rounded-xl px-3 py-2 mb-4'>
                      ⚠ {gpsError}
                    </p>
                  )}

                  <button
                    onClick={handleStart}
                    className='w-full py-4 rounded-3xl text-base font-black bg-[#FF7F11] text-white
                      hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-[#FF7F11]/20'
                  >
                    {selectedRoute ? `Start Ride — ${selectedRoute.name}` : 'Start Free Ride'}
                  </button>
                </>
              )}
            </>
          )}

          {/* ══════════════ HISTORY TAB ══════════════ */}
          {activeTab === 'history' && showTabs && (
            <div className='bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-5'>
              <p className='text-brand-sage text-xs font-bold uppercase tracking-widest mb-4'>
                Your Past Rides
              </p>

              {historyLoading && (
                <div className='flex items-center justify-center py-10 text-brand-sage/40 text-sm gap-2'>
                  <svg className='w-4 h-4 animate-spin' viewBox='0 0 24 24' fill='none'>
                    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' strokeDasharray='40 20'/>
                  </svg>
                  Loading rides…
                </div>
              )}

              {historyError && (
                <p className='text-brand-red text-xs text-center py-6'>{historyError}</p>
              )}

              {!historyLoading && !historyError && history.length === 0 && (
                <div className='text-center py-10'>
                  <p className='text-brand-sage/40 text-sm'>No rides recorded yet.</p>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className='mt-3 text-[#FF7F11] text-sm font-semibold hover:underline'
                  >
                    Start your first ride →
                  </button>
                </div>
              )}

              {!historyLoading && history.length > 0 && (
                <div className='space-y-3 max-h-[62vh] overflow-y-auto pr-1'>
                  {history.map(ride => (
                    <RideHistoryItem key={ride._id} ride={ride} onOpen={setModalRideId} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Ride Detail Modal ── */}
      {modalRideId && (
        <RideModal
          rideId={modalRideId}
          onClose={() => setModalRideId(null)}
          onDeleted={handleRideDeleted}
          onUpdated={handleRideUpdated}
        />
      )}
    </div>
  );
}
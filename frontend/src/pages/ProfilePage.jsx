import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserCommunityProfile } from '../services/userService';
import * as rideSvc from '../services/rideService';
import UserActivityModal  from '../components/interactions/UserActivityModal'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDuration(totalMinutes) {
  if (!totalMinutes) return '0 min';
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m} min`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Small reusable stat card ─────────────────────────────────────────────────
function StatCard({ value, label, accent = false }) {
  return (
    <div className='bg-white rounded-xl p-6 border border-[#E2E8CE] text-center'>
      <div className={`text-4xl font-bold mb-2 ${accent ? 'text-[#FF7F11]' : 'text-[#ACBFA4]'}`}>
        {value}
      </div>
      <div className='text-[#262626] opacity-70 text-sm'>{label}</div>
    </div>
  );
}

// ─── Eco impact section inside the tab ───────────────────────────────────────
function EcoImpactDashboard({ rideStats, impactStats, ridesLoading }) {
  if (ridesLoading) {
    return (
      <div className='text-center py-12 text-[#ACBFA4] text-sm font-medium'>
        Loading eco impact data…
      </div>
    );
  }

  const ecoItems = [
    {
      icon: '🌱',
      label: 'CO₂ Saved',
      value: `${(impactStats?.totalCo2 || 0).toFixed(2)} kg`,
      sub: 'Carbon emissions avoided',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
    },
    {
      icon: '⛽',
      label: 'Fuel Saved',
      value: `${(impactStats?.totalFuel || 0).toFixed(2)} L`,
      sub: 'Equivalent fuel not burned',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-[#FF7F11]',
    },
    {
      icon: '🔥',
      label: 'Calories Burned',
      value: `${(impactStats?.totalCalories || 0).toLocaleString()} kcal`,
      sub: 'Energy spent cycling',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-[#FF1B1C]',
    },
    {
      icon: '⭐',
      label: 'Total Eco Score',
      value: `${(impactStats?.totalScore || 0).toLocaleString()} pts`,
      sub: 'Cumulative eco points',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
    },
  ];

  const rideItems = [
    {
      label: 'Total Rides',
      value: rideStats?.total_rides ?? 0,
    },
    {
      label: 'Total Distance',
      value: `${(rideStats?.total_distance || 0).toFixed(1)} km`,
    },
    {
      label: 'Total Ride Time',
      value: fmtDuration(rideStats?.total_duration || 0),
    },
    {
      label: 'Avg Distance / Ride',
      value: rideStats?.total_rides > 0
        ? `${((rideStats.total_distance || 0) / rideStats.total_rides).toFixed(1)} km`
        : '—',
    },
  ];

  const hasData = (rideStats?.total_rides || 0) > 0;

  return (
    <div className='space-y-8'>
      {/* Ride summary row */}
      <div>
        <h3 className='text-lg font-bold text-[#262626] mb-4'>Ride Summary</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {rideItems.map(item => (
            <div key={item.label}
              className='bg-[#E2E8CE]/50 rounded-xl p-4 text-center border border-[#E2E8CE]'>
              <p className='text-2xl font-black text-[#262626]'>{item.value}</p>
              <p className='text-xs text-[#262626]/60 mt-1'>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Eco Impact cards */}
      <div>
        <div className='flex items-center gap-2 mb-4'>
          <h3 className='text-lg font-bold text-[#262626]'>Eco Impact</h3>
          <span className='text-xs bg-green-100 text-green-700 border border-green-200
            px-2 py-0.5 rounded-full font-semibold'>
            All time
          </span>
        </div>

        {!hasData ? (
          <div className='text-center py-10 rounded-2xl bg-[#E2E8CE]/40 border border-[#E2E8CE]'>
            <p className='text-5xl mb-3'>🚴</p>
            <p className='text-[#262626]/60 text-sm font-medium'>
              No rides yet. Start your first ride to see your eco impact!
            </p>
            <a href='/ride'
              className='inline-block mt-4 px-5 py-2 bg-[#FF7F11] text-white text-sm
                font-bold rounded-xl hover:opacity-90 transition-opacity'>
              Go to Ride Tracker →
            </a>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {ecoItems.map(item => (
              <div key={item.label}
                className={`${item.bg} ${item.border} border rounded-2xl p-5 flex items-start gap-4`}>
                <span className='text-3xl flex-shrink-0'>{item.icon}</span>
                <div>
                  <p className={`text-2xl font-black ${item.text}`}>{item.value}</p>
                  <p className='text-sm font-semibold text-[#262626]/70 mt-0.5'>{item.label}</p>
                  <p className='text-xs text-[#262626]/45 mt-0.5'>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fun equivalents strip — only when there's data */}
      {hasData && (
        <div className='bg-[#262626] rounded-2xl p-5'>
          <p className='text-[#ACBFA4] text-xs font-bold uppercase tracking-widest mb-4'>
            What your cycling is equivalent to
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-center'>
            <div className='bg-white/5 rounded-xl p-3'>
              <p className='text-2xl font-black text-[#ACBFA4]'>
                {Math.round((impactStats?.totalCo2 || 0) / 0.12)}
              </p>
              <p className='text-xs text-[#ACBFA4]/50 mt-1'>plastic bags not used</p>
            </div>
            <div className='bg-white/5 rounded-xl p-3'>
              <p className='text-2xl font-black text-[#FF7F11]'>
                {Math.round((impactStats?.totalFuel || 0) / 0.85)}
              </p>
              <p className='text-xs text-[#ACBFA4]/50 mt-1'>car trips avoided</p>
            </div>
            <div className='bg-white/5 rounded-xl p-3'>
              <p className='text-2xl font-black text-[#E2E8CE]'>
                {((impactStats?.totalCo2 || 0) / 21).toFixed(1)}
              </p>
              <p className='text-xs text-[#ACBFA4]/50 mt-1'>trees' monthly absorption</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  //my activity button
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Ride / eco data
  const [rideStats, setRideStats] = useState(null);
  const [impactStats, setImpactStats] = useState(null);
  const [ridesLoading, setRidesLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Lazy-load ride data only when the tab is first opened
  useEffect(() => {
    if (activeTab === 'eco' && rideStats === null && !ridesLoading) {
      fetchEcoData();
    }
  }, [activeTab]); // eslint-disable-line

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserCommunityProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEcoData = async () => {
    setRidesLoading(true);
    try {
      const [rideRes, impactRes] = await Promise.all([
        rideSvc.getMyStats(),
        rideSvc.getMyImpactStats(),
      ]);
      setRideStats(rideRes.data);
      setImpactStats(impactRes.data);
    } catch (err) {
      console.error('Failed to load eco data:', err);
    } finally {
      setRidesLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className='min-h-screen pt-20 flex items-center justify-center bg-[#E2E8CE]'>
        <div className='text-[#ACBFA4] text-xl font-semibold'>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='min-h-screen pt-20 flex items-center justify-center bg-[#E2E8CE]'>
        <div className='text-[#FF1B1C] text-xl'>Failed to load profile</div>
      </div>
    );
  }

  const { user: userData, statistics, recentEvents, recentChallenges } = profile;

  const TABS = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'eco',      label: '🌿 Eco Impact' },
    { key: 'events',   label: '📅 My Events' },
    { key: 'challenges', label: '🏆 My Challenges' },
  ];

  return (
    <div className='min-h-screen pt-20 pb-8 px-6 bg-[#E2E8CE]'>
      <div className='max-w-5xl mx-auto'>

        {/* Profile Header */}
        <div className='bg-white rounded-2xl p-8 mb-6 border border-[#E2E8CE]'>
          <div className='flex items-center gap-6'>
            <div className='w-24 h-24 bg-[#ACBFA4] rounded-full flex items-center justify-center
              text-4xl font-bold text-white'>
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <h1 className='text-3xl font-bold text-[#262626]'>{userData.name}</h1>
                {userData.role === 'admin' && (
                  <span className='bg-[#FF7F11] text-white px-3 py-1 rounded-full text-sm font-semibold'>
                    👑 Admin
                  </span>
                )}
              </div>
              <p className='text-[#262626] opacity-60'>{userData.email}</p>

              <button 
                onClick={() => setShowHistoryModal(true)}
                className="mt-3 flex items-center gap-2 text-xs font-bold text-[#ACBFA4] hover:text-[#FF7F11] transition-all bg-[#E2E8CE]/40 px-4 py-2 rounded-full hover:scale-105 active:scale-95 shadow-sm"
              >
                📋 View My Activity History
              </button>
              <p className='text-[#262626] opacity-40 text-sm mt-1'>
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className='px-6 py-3 bg-[#FF1B1C] text-white rounded-lg
                hover:opacity-80 transition-opacity font-semibold'
            >
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <StatCard value={statistics.eventsJoined} label='Events Joined' />
          <StatCard value={statistics.challengesJoined} label='Challenges' />
          <StatCard
            value={`${parseFloat(statistics.totalDistance).toLocaleString()} km`}
            label='Total Distance'
          />
          <StatCard
            value={`${statistics.co2Saved} kg`}
            label='CO₂ Saved'
            accent
          />
        </div>

        {/* Admin Panel */}
        {userData.role === 'admin' && (
          <div className='bg-white rounded-xl p-6 border border-[#E2E8CE] mb-6'>
            <h3 className='text-xl font-bold text-[#262626] mb-4'>👑 Admin Panel</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <button
                onClick={() => navigate('/community/events')}
                className='p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg text-left
                  hover:bg-opacity-100 transition-all'
              >
                <div className='text-2xl mb-2'>📅</div>
                <div className='font-semibold text-[#262626]'>Manage Events</div>
                <div className='text-sm text-[#262626] opacity-60'>Create, edit, delete events</div>
              </button>
              <button
                onClick={() => navigate('/community/challenges')}
                className='p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg text-left
                  hover:bg-opacity-100 transition-all'
              >
                <div className='text-2xl mb-2'>🏆</div>
                <div className='font-semibold text-[#262626]'>Manage Challenges</div>
                <div className='text-sm text-[#262626] opacity-60'>Create, edit, delete challenges</div>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className='bg-white rounded-2xl border border-[#E2E8CE] overflow-hidden'>
          <div className='flex border-b border-[#E2E8CE] overflow-x-auto'>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-max px-5 py-4 font-semibold text-sm transition-colors
                  ${activeTab === tab.key
                    ? 'bg-[#ACBFA4] text-[#262626]'
                    : 'bg-white text-[#262626] opacity-60 hover:opacity-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className='p-6'>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-xl font-bold text-[#262626] mb-4'>Recent Activity</h3>
                  <div className='space-y-3'>
                    {recentEvents.length === 0 && recentChallenges.length === 0 ? (
                      <p className='text-[#262626] opacity-60 text-center py-8'>
                        No activity yet. Start by joining events and challenges!
                      </p>
                    ) : (
                      <>
                        {recentEvents.slice(0, 3).map((event, index) => (
                          <div key={index}
                            className='flex items-center gap-4 p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg'>
                            <div className='w-10 h-10 bg-[#ACBFA4] rounded-lg flex items-center
                              justify-center text-xl'>
                              📅
                            </div>
                            <div className='flex-1'>
                              <p className='font-semibold text-[#262626]'>{event.title}</p>
                              <p className='text-sm text-[#262626] opacity-60'>
                                Joined {new Date(event.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className='text-xs bg-[#ACBFA4] text-[#262626] px-3 py-1 rounded-full'>
                              {event.status}
                            </span>
                          </div>
                        ))}
                        {recentChallenges.slice(0, 3).map((challenge, index) => (
                          <div key={index}
                            className='flex items-center gap-4 p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg'>
                            <div className='w-10 h-10 bg-[#FF7F11] rounded-lg flex items-center
                              justify-center text-xl'>
                              🏆
                            </div>
                            <div className='flex-1'>
                              <p className='font-semibold text-[#262626]'>{challenge.title}</p>
                              <p className='text-sm text-[#262626] opacity-60'>
                                {challenge.progress} km progress
                              </p>
                            </div>
                            <span className='text-xs bg-[#FF7F11] text-white px-3 py-1 rounded-full'>
                              {challenge.status}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Eco Impact Tab ── */}
            {activeTab === 'eco' && (
              <EcoImpactDashboard
                rideStats={rideStats}
                impactStats={impactStats}
                ridesLoading={ridesLoading}
              />
            )}

            {/* ── Events Tab ── */}
            {activeTab === 'events' && (
              <div>
                <h3 className='text-xl font-bold text-[#262626] mb-4'>My Events</h3>
                {recentEvents.length === 0 ? (
                  <p className='text-[#262626] opacity-60 text-center py-8'>
                    You haven't joined any events yet.
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {recentEvents.map((event, index) => (
                      <div key={index}
                        className='flex items-center justify-between p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg'>
                        <div>
                          <p className='font-semibold text-[#262626]'>{event.title}</p>
                          <p className='text-sm text-[#262626] opacity-60'>
                            {event.location} • {new Date(event.eventDate).toLocaleDateString()}
                          </p>
                          <p className='text-xs text-[#ACBFA4] mt-1'>
                            Joined: {new Date(event.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className='text-xs bg-[#ACBFA4] text-[#262626] px-3 py-1 rounded-full'>
                          {event.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Challenges Tab ── */}
            {activeTab === 'challenges' && (
              <div>
                <h3 className='text-xl font-bold text-[#262626] mb-4'>My Challenges</h3>
                {recentChallenges.length === 0 ? (
                  <p className='text-[#262626] opacity-60 text-center py-8'>
                    You haven't joined any challenges yet.
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {recentChallenges.map((challenge, index) => (
                      <div key={index}
                        className='flex items-center justify-between p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg'>
                        <div>
                          <p className='font-semibold text-[#262626]'>{challenge.title}</p>
                          <p className='text-sm text-[#262626] opacity-60'>
                            {challenge.progress} / {challenge.targetDistance} km
                          </p>
                          <p className='text-xs text-[#ACBFA4] mt-1'>
                            Joined: {new Date(challenge.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className='text-xs bg-[#FF7F11] text-white px-3 py-1 rounded-full'>
                          {challenge.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/community')}
          className='mt-6 px-6 py-3 bg-[#ACBFA4] text-[#262626] rounded-lg
            hover:opacity-90 transition-opacity font-semibold'
        >
          ← Back to Community Hub
        </button>
      </div>

      {showHistoryModal && (
        <UserActivityModal
          token={token}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

    </div>
  );
}
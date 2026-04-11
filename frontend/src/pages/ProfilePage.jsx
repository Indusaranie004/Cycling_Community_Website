import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserCommunityProfile } from '../services/userService';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, []);

const fetchProfile = async () => {
  try {
    setLoading(true);
    const data = await getUserCommunityProfile();
    console.log('📊 Profile Data:', data);  // ✅ Debug log
    console.log('📅 Events:', data.recentEvents);  // ✅ Debug log
    console.log('🏆 Challenges:', data.recentChallenges);  // ✅ Debug log
    setProfile(data);
  } catch (err) {
    console.error('Failed to load profile:', err);
  } finally {
    setLoading(false);
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

  return (
    <div className='min-h-screen pt-20 pb-8 px-6 bg-[#E2E8CE]'>
      <div className='max-w-5xl mx-auto'>
        {/* Profile Header */}
        <div className='bg-white rounded-2xl p-8 mb-6 border border-[#E2E8CE]'>
          <div className='flex items-center gap-6'>
            <div className='w-24 h-24 bg-[#ACBFA4] rounded-full flex items-center justify-center text-4xl font-bold text-white'>
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
          <div className='bg-white rounded-xl p-6 border border-[#E2E8CE] text-center'>
            <div className='text-4xl font-bold text-[#ACBFA4] mb-2'>
              {statistics.eventsJoined}
            </div>
            <div className='text-[#262626] opacity-70 text-sm'>Events Joined</div>
          </div>

          <div className='bg-white rounded-xl p-6 border border-[#E2E8CE] text-center'>
            <div className='text-4xl font-bold text-[#ACBFA4] mb-2'>
              {statistics.challengesJoined}
            </div>
            <div className='text-[#262626] opacity-70 text-sm'>Challenges</div>
          </div>

          <div className='bg-white rounded-xl p-6 border border-[#E2E8CE] text-center'>
            <div className='text-4xl font-bold text-[#ACBFA4] mb-2'>
              {parseFloat(statistics.totalDistance).toLocaleString()} km
            </div>
            <div className='text-[#262626] opacity-70 text-sm'>Total Distance</div>
          </div>

          <div className='bg-white rounded-xl p-6 border border-[#E2E8CE] text-center'>
            <div className='text-4xl font-bold text-[#FF7F11] mb-2'>
              {statistics.co2Saved} kg
            </div>
            <div className='text-[#262626] opacity-70 text-sm'>CO₂ Saved</div>
          </div>
        </div>

        {/* Admin Panel (Only for Admins) */}
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
          <div className='flex border-b border-[#E2E8CE]'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors
                ${activeTab === 'overview' 
                  ? 'bg-[#ACBFA4] text-[#262626]' 
                  : 'bg-white text-[#262626] opacity-60 hover:opacity-100'}`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors
                ${activeTab === 'events' 
                  ? 'bg-[#ACBFA4] text-[#262626]' 
                  : 'bg-white text-[#262626] opacity-60 hover:opacity-100'}`}
            >
              📅 My Events
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors
                ${activeTab === 'challenges' 
                  ? 'bg-[#ACBFA4] text-[#262626]' 
                  : 'bg-white text-[#262626] opacity-60 hover:opacity-100'}`}
            >
              🏆 My Challenges
            </button>
          </div>

          {/* Tab Content */}
          <div className='p-6'>
            {/* Overview Tab */}
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
                          <div key={index} className='flex items-center gap-4 p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg'>
                            <div className='w-10 h-10 bg-[#ACBFA4] rounded-lg flex items-center justify-center text-xl'>
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
                          <div key={index} className='flex items-center gap-4 p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg'>
                            <div className='w-10 h-10 bg-[#FF7F11] rounded-lg flex items-center justify-center text-xl'>
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

            {/* Events Tab - Shows event names and join dates */}
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
                      <div key={index} className='flex items-center justify-between p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg'>
                        <div>
                          <p className='font-semibold text-[#262626]'>{event.title}</p>  {/* ✅ Event name */}
                          <p className='text-sm text-[#262626] opacity-60'>
                            {event.location} • {new Date(event.eventDate).toLocaleDateString()}
                          </p>
                          <p className='text-xs text-[#ACBFA4] mt-1'>
                            Joined: {new Date(event.joinedAt).toLocaleDateString()}  {/* ✅ Join date */}
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

            {/* Challenges Tab - Shows challenge names and join dates */}
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
                      <div key={index} className='flex items-center justify-between p-4 bg-[#E2E8CE] bg-opacity-50 rounded-lg'>
                        <div>
                          <p className='font-semibold text-[#262626]'>{challenge.title}</p>  {/* ✅ Challenge name */}
                          <p className='text-sm text-[#262626] opacity-60'>
                            {challenge.progress} / {challenge.targetDistance} km
                          </p>
                          <p className='text-xs text-[#ACBFA4] mt-1'>
                            Joined: {new Date(challenge.joinedAt).toLocaleDateString()}  {/* ✅ Join date */}
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
    </div>
  );
}
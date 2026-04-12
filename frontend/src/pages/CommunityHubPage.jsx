import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallenges, getLeaderboard, getEvents } from '../services/communityService';

export default function CommunityHubPage() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const challengesData = await getChallenges();
      setChallenges(challengesData.slice(0, 3));

      const eventsData = await getEvents();
      setEvents(eventsData.slice(0, 3));

      if (challengesData.length > 0) {
        const lb = await getLeaderboard(challengesData[0].challengeId);
        setLeaderboard(lb.slice(0, 5));
      }

    
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen pt-20 flex items-center justify-center bg-[#E2E8CE]'>
        <div className='text-[#ACBFA4] text-xl font-semibold'>Loading Community Hub...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pt-20 pb-8 px-6 bg-[#E2E8CE]'>
      {/* Header */}
      <div className='max-w-7xl mx-auto mb-8'>
        <h1 className='text-4xl font-bold text-[#262626] mb-2'>Community Hub</h1>
        <p className='text-[#262626] opacity-70'>Join events, compete in challenges, and track your progress</p>
      </div>

      {/* Event & Challenge Cards */}
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        {/* Events Card */}
        <div
          onClick={() => navigate('/community/events')}
          className='bg-white rounded-2xl p-8 cursor-pointer hover:shadow-xl transition-shadow border border-[#E2E8CE]'
        >
          <div className='w-16 h-16 bg-[#ACBFA4] rounded-2xl flex items-center justify-center mb-6'>
            <span className='text-3xl'>📅</span>
          </div>
          <h2 className='text-2xl font-bold text-[#262626] mb-3'>Events</h2>
          <p className='text-[#262626] opacity-70 mb-6'>Join group rides, workshops, and community cycling events</p>
          <button className='text-[#FF7F11] font-semibold hover:underline flex items-center gap-2'>
            View all events 
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 17L17 7M17 7H7M17 7V17' />
            </svg>
          </button>
        </div>

        {/* Challenges Card */}
        <div
          onClick={() => navigate('/community/challenges')}
          className='bg-white rounded-2xl p-8 cursor-pointer hover:shadow-xl transition-shadow border border-[#E2E8CE]'
        >
          <div className='w-16 h-16 bg-[#FF7F11] rounded-2xl flex items-center justify-center mb-6'>
            <span className='text-3xl'>🎯</span>
          </div>
          <h2 className='text-2xl font-bold text-[#262626] mb-3'>Challenges</h2>
          <p className='text-[#262626] opacity-70 mb-6'>Compete in distance challenges and climb the leaderboard</p>
          <button className='text-[#FF7F11] font-semibold hover:underline flex items-center gap-2'>
            View all challenges
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 17L17 7M17 7H7M17 7V17' />
            </svg>
          </button>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className='max-w-7xl mx-auto bg-white rounded-2xl p-8 border border-[#E2E8CE]'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-[#FF7F11] rounded-xl flex items-center justify-center'>
              <span className='text-2xl'>🏆</span>
            </div>
            <div>
              <h2 className='text-2xl font-bold text-[#262626]'>Leaderboard</h2>
              <p className='text-[#262626] opacity-70 text-sm'>Top cyclists this {timeFilter}</p>
            </div>
          </div>
          
          {/* Time Filter */}
          <div className='flex gap-2 bg-[#E2E8CE] p-1 rounded-lg'>
            {['week', 'month', 'all'].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors
                  ${timeFilter === filter 
                    ? 'bg-[#ACBFA4] text-[#262626]' 
                    : 'text-[#262626] opacity-60 hover:opacity-100'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        {leaderboard.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-[#262626] opacity-60'>No participants yet. Be the first!</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {leaderboard.map((participant, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              const bgColors = ['bg-[#FFD700]', 'bg-[#C0C0C0]', 'bg-[#CD7F32]'];
              
              return (
                <div
                  key={participant.userId}
                  className={`flex items-center justify-between p-4 rounded-xl
                    ${index < 3 ? bgColors[index] + ' bg-opacity-30' : 'bg-[#E2E8CE] bg-opacity-50'}`}
                >
                  <div className='flex items-center gap-4'>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${index < 3 ? bgColors[index] : 'bg-[#ACBFA4]'}`}>
                      {index < 3 ? medals[index] : `#${index + 1}`}
                    </div>
                    <div>
                      <p className='font-semibold text-[#262626]'>
                        {participant.userName || `User ${participant.userId.toString().slice(0, 6)}`}
                      </p>
                      <p className='text-sm text-[#262626] opacity-60'>
                        {participant.progress} km cycled
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-[#ACBFA4] text-lg'>
                      {(participant.progress * 0.27).toFixed(1)} kg
                    </p>
                    <p className='text-xs text-[#262626] opacity-60'>CO₂ saved</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
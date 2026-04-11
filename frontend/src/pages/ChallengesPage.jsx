import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallenges, joinChallenge, getLeaderboard, getUserJoinedChallenges } from '../services/communityService';
import { useAuth } from '../context/AuthContext';
import Leaderboard from '../components/community/challenges/Leaderboard';
import LogProgressForm from '../components/community/challenges/LogProgressForm';
import CreateChallengeForm from '../components/community/challenges/CreateChallengeForm';

export default function ChallengesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'joined'

  useEffect(() => {
    fetchChallenges();
    if (user?.id) {
      fetchJoinedChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const data = await getChallenges();
      setChallenges(data);
      if (data.length > 0) {
        setSelectedChallenge(data[0]);
        const lb = await getLeaderboard(data[0].challengeId);
        setLeaderboard(lb);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedChallenges = async () => {
    try {
      const data = await getUserJoinedChallenges();
      setJoinedChallenges(data);
    } catch (err) {
      console.error('Failed to load joined challenges:', err);
    }
  };

  const handleJoin = async (challengeId) => {
    try {
      await joinChallenge(challengeId);
      alert('Successfully joined challenge! 🏆');
      // Refresh both lists
      fetchChallenges();
      fetchJoinedChallenges();
      // Refresh leaderboard if this challenge is selected
      if (selectedChallenge && selectedChallenge.challengeId === challengeId) {
        const lb = await getLeaderboard(challengeId);
        setLeaderboard(lb);
      }
    } catch (err) {
      console.error('Join challenge error:', err);
      alert(err.response?.data?.error || 'Failed to join challenge');
    }
  };

  const handleSelectChallenge = async (challenge) => {
    setSelectedChallenge(challenge);
    const lb = await getLeaderboard(challenge.challengeId);
    setLeaderboard(lb);
  };

  const handleProgressSuccess = () => {
    if (selectedChallenge) {
      getLeaderboard(selectedChallenge.challengeId).then(setLeaderboard);
      fetchJoinedChallenges(); // Refresh joined challenges to show updated progress
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen pt-20 flex items-center justify-center bg-[#E2E8CE]'>
        <div className='text-[#ACBFA4] text-xl font-semibold'>Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pt-20 pb-8 px-6 bg-[#E2E8CE]'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-bold text-[#262626] mb-2'>🏆 Community Challenges</h1>
            <p className='text-[#262626] opacity-70'>Compete and track your cycling progress</p>
          </div>

          {/* Show Create button only for admins */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className='px-6 py-3 bg-[#ACBFA4] text-[#262626] rounded-lg 
                hover:opacity-90 transition-opacity font-semibold'
            >
              {showCreateForm ? 'Cancel' : '+ Create Challenge'}
            </button>
          )}
        </div>

        {/* Create Challenge Form */}
        {showCreateForm && (
          <div className='mb-8'>
            <CreateChallengeForm
              onSuccess={() => {
                fetchChallenges();
                setShowCreateForm(false);
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Tabs for Available and Joined Challenges */}
        <div className='mb-6'>
          <div className='flex gap-4 border-b-2 border-[#E2E8CE]'>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 -mb-0.5
                ${activeTab === 'available'
                  ? 'border-[#ACBFA4] text-[#ACBFA4]'
                  : 'border-transparent text-[#262626] opacity-60 hover:opacity-100'}`}
            >
              📋 Available Challenges ({challenges.length})
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 -mb-0.5
                ${activeTab === 'joined'
                  ? 'border-[#ACBFA4] text-[#ACBFA4]'
                  : 'border-transparent text-[#262626] opacity-60 hover:opacity-100'}`}
            >
              ✅ My Challenges ({joinedChallenges.length})
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Challenges List */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Available Challenges Tab */}
            {activeTab === 'available' && (
              <>
                {challenges.length === 0 ? (
                  <div className='bg-white rounded-2xl p-8 border border-[#E2E8CE] text-center'>
                    <p className='text-[#262626] opacity-60 text-lg mb-4'>No challenges available yet</p>
                    {user?.role === 'admin' && (
                      <p className='text-[#FF7F11] text-sm'>👑 Admins can create challenges</p>
                    )}
                  </div>
                ) : (
                  challenges.map((challenge) => (
                    <div
                      key={challenge.challengeId}
                      onClick={() => handleSelectChallenge(challenge)}
                      className={`bg-white rounded-2xl p-6 cursor-pointer 
                        hover:shadow-lg transition-shadow border-2 
                        ${selectedChallenge?.challengeId === challenge.challengeId
                          ? 'border-[#ACBFA4]'
                          : 'border-[#E2E8CE]'}`}
                    >
                      <h3 className='text-xl font-bold text-[#262626] mb-2'>{challenge.title}</h3>
                      <p className='text-[#262626] opacity-70 mb-4'>{challenge.description}</p>

                      <div className='flex items-center gap-4 text-sm text-[#262626] opacity-60 mb-4 flex-wrap'>
                        <span>🎯 {challenge.targetDistance} km</span>
                        <span>📅 {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${challenge.status === 'active' ? 'bg-[#ACBFA4] text-[#262626]' :
                            challenge.status === 'upcoming' ? 'bg-[#E2E8CE] text-[#262626]' :
                              'bg-gray-200 text-[#262626]'}`}>
                          {challenge.status}
                        </span>
                      </div>

                      {/* Show Join button only for non-admins */}
                      {user?.role !== 'admin' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleJoin(challenge.challengeId); }}
                          className='px-6 py-2 bg-[#ACBFA4] text-[#262626] rounded-lg 
                            hover:opacity-90 transition-opacity font-semibold'
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {/* Joined Challenges Tab */}
            {activeTab === 'joined' && (
              <>
                {joinedChallenges.length === 0 ? (
                  <div className='bg-white rounded-2xl p-8 border border-[#E2E8CE] text-center'>
                    <p className='text-[#262626] opacity-60 text-lg mb-4'>You haven't joined any challenges yet</p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className='text-[#FF7F11] hover:underline font-semibold'
                    >
                      Browse available challenges →
                    </button>
                  </div>
                ) : (
                  joinedChallenges.map((challenge) => (
                    <div
                      key={challenge.challengeId}
                      onClick={() => handleSelectChallenge(challenge)}
                      className={`bg-white rounded-2xl p-6 cursor-pointer 
                        hover:shadow-lg transition-shadow border-2 
                        ${selectedChallenge?.challengeId === challenge.challengeId
                          ? 'border-[#ACBFA4]'
                          : 'border-[#E2E8CE]'}`}
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h3 className='text-xl font-bold text-[#262626]'>{challenge.title}</h3>
                        <span className='bg-[#ACBFA4] text-[#262626] px-3 py-1 rounded-full text-xs font-semibold'>
                          ✅ Joined
                        </span>
                      </div>
                      <p className='text-[#262626] opacity-70 mb-4'>{challenge.description}</p>

                      <div className='flex items-center gap-4 text-sm text-[#262626] opacity-60 mb-4 flex-wrap'>
                        <span>🎯 {challenge.targetDistance} km</span>
                        <span>📊 Your Progress: <span className='font-bold text-[#ACBFA4]'>{challenge.userProgress} km</span></span>
                        <span>📅 {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : 'TBD'}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${challenge.status === 'active' ? 'bg-[#ACBFA4] text-[#262626]' :
                            challenge.status === 'upcoming' ? 'bg-[#E2E8CE] text-[#262626]' :
                              'bg-gray-200 text-[#262626]'}`}>
                          {challenge.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className='mb-4'>
                        <div className='flex justify-between text-sm mb-1'>
                          <span className='text-[#262626] opacity-60'>Progress</span>
                          <span className='text-[#3B82F6] font-semibold'>
                            {challenge.targetDistance && challenge.targetDistance > 0 && challenge.userProgress !== undefined
                              ? `${Math.min((challenge.userProgress / challenge.targetDistance) * 100, 100).toFixed(1)}%`
                              : '0.0%'}
                          </span>
                        </div>
                        <div className='w-full bg-[#E2E8CE] rounded-full h-3'>
                          <div
                            className='bg-[#3B82F6] h-3 rounded-full transition-all'
                            style={{
                              width: `${challenge.targetDistance && challenge.targetDistance > 0 && challenge.userProgress !== undefined
                                  ? Math.min((challenge.userProgress / challenge.targetDistance) * 100, 100)
                                  : 0
                                }%`
                            }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectChallenge(challenge);
                          setActiveTab('available'); // Switch to available tab to see leaderboard
                        }}
                        className='px-6 py-2 bg-[#FF7F11] text-white rounded-lg 
                          hover:opacity-90 transition-opacity font-semibold'
                      >
                        View Leaderboard & Log Progress
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Leaderboard Panel */}
          <div className='lg:col-span-1'>
            <div className='sticky top-20'>
              <Leaderboard
                leaderboard={leaderboard}
                challengeTitle={selectedChallenge?.title}
              />

              {/* Show progress form only for non-admins */}
              {selectedChallenge && (
                <LogProgressForm
                  challengeId={selectedChallenge.challengeId}
                  onSuccess={handleProgressSuccess}
                  userRole={user?.role}
                />
              )}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/community')}
          className='mt-8 px-6 py-3 bg-[#ACBFA4] text-[#262626] rounded-lg 
            hover:opacity-90 transition-opacity font-semibold'
        >
          ← Back to Community Hub
        </button>
      </div>
    </div>
  );
}
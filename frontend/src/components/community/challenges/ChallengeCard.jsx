import React from 'react';

export default function ChallengeCard({ 
  challenge, 
  onSelect, 
  onJoin, 
  userRole, 
  isJoined = false,
  userProgress = 0,
  isSelected = false 
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!challenge.targetDistance || challenge.targetDistance === 0) return 0;
    return Math.min((userProgress / challenge.targetDistance) * 100, 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-[#ACBFA4] text-[#262626]';
      case 'upcoming':
        return 'bg-[#E2E8CE] text-[#262626]';
      default:
        return 'bg-gray-200 text-[#262626]';
    }
  };

  return (
    <div
      onClick={() => onSelect(challenge)}
      className={`bg-white rounded-2xl p-6 cursor-pointer 
        hover:shadow-lg transition-all border-2
        ${isSelected 
          ? 'border-[#ACBFA4] shadow-lg' 
          : 'border-[#E2E8CE]'}`}
    >
      {/* Header with Title & Joined Badge */}
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-xl font-bold text-[#262626]'>{challenge.title}</h3>
        {isJoined && (
          <span className='bg-[#ACBFA4] text-[#262626] px-3 py-1 rounded-full text-xs font-semibold'>
            ✅ Joined
          </span>
        )}
      </div>

      {/* Description */}
      <p className='text-[#262626] opacity-70 mb-4 line-clamp-2'>
        {challenge.description}
      </p>

      {/* Challenge Details */}
      <div className='flex items-center gap-4 text-sm text-[#262626] opacity-60 mb-4 flex-wrap'>
        <span>🎯 {challenge.targetDistance} km</span>
        <span>📅 {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
          ${getStatusColor(challenge.status)}`}>
          {challenge.status}
        </span>
      </div>

      {/* Progress Bar (Only for joined challenges) */}
      {isJoined && (
        <div className='mb-4'>
          <div className='flex justify-between text-sm mb-1'>
            <span className='text-[#262626] opacity-60'>Your Progress</span>
            <span className='text-[#ACBFA4] font-semibold'>
              {userProgress} / {challenge.targetDistance} km
            </span>
          </div>
          <div className='w-full bg-[#E2E8CE] rounded-full h-3'>
            <div 
              className='bg-[#ACBFA4] h-3 rounded-full transition-all'
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <p className='text-xs text-[#262626] opacity-60 mt-1 text-right'>
            {calculateProgress().toFixed(1)}% complete
          </p>
        </div>
      )}

      {/* Action Button */}
      <div className='mt-4'>
        {userRole === 'admin' ? (
          <p className='text-[#FF7F11] text-sm text-center py-2 font-medium'>
            👑 Admins cannot join challenges
          </p>
        ) : isJoined ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(challenge);
            }}
            className='w-full py-2 bg-[#FF7F11] text-white rounded-lg 
              hover:opacity-90 transition-opacity font-semibold'
          >
            View Leaderboard & Log Progress
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin(challenge.challengeId);
            }}
            className='w-full py-2 bg-[#ACBFA4] text-[#262626] rounded-lg 
              hover:opacity-90 transition-opacity font-semibold'
          >
            Join Challenge
          </button>
        )}
      </div>
    </div>
  );
}
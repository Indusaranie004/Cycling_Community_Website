import React from 'react';

export default function Leaderboard({ leaderboard, challengeTitle }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className='bg-white rounded-2xl p-6 border border-[#E2E8CE]'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-10 h-10 bg-[#FF7F11] rounded-lg flex items-center justify-center'>
            <span className='text-xl'>🏆</span>
          </div>
          <div>
            <h2 className='text-xl font-bold text-[#262626]'>Leaderboard</h2>
            {challengeTitle && (
              <p className='text-xs text-[#262626] opacity-60'>{challengeTitle}</p>
            )}
          </div>
        </div>
        <p className='text-[#262626] opacity-60 text-center py-8'>No participants yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl p-6 border border-[#E2E8CE]'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-10 h-10 bg-[#FF7F11] rounded-lg flex items-center justify-center'>
          <span className='text-xl'>🏆</span>
        </div>
        <div>
          <h2 className='text-xl font-bold text-[#262626]'>Leaderboard</h2>
          {challengeTitle && (
            <p className='text-xs text-[#262626] opacity-60'>{challengeTitle}</p>
          )}
        </div>
      </div>
      
      <div className='space-y-3'>
        {leaderboard.map((participant, index) => {
          const medals = ['🥇', '🥈', '🥉'];
          const bgColors = ['bg-[#FFD700]', 'bg-[#C0C0C0]', 'bg-[#CD7F32]'];
          
          return (
            <div
              key={participant.userId || index}
              className={`flex items-center justify-between p-3 rounded-xl
                ${index < 3 ? bgColors[index] + ' bg-opacity-30' : 'bg-[#E2E8CE] bg-opacity-50'}`}
            >
              <div className='flex items-center gap-3'>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index < 3 ? bgColors[index] : 'bg-[#ACBFA4]'}`}>
                  {index < 3 ? medals[index] : `#${index + 1}`}
                </div>
                <div>
                  <span className='font-medium text-[#262626]'>
                    {participant.userName || `User ${participant.userId?.toString().slice(0, 6) || 'Unknown'}`}
                  </span>
                  <p className='text-xs text-[#262626] opacity-60'>
                    {participant.progress} km cycled
                  </p>
                </div>
              </div>
              <span className='text-[#ACBFA4] font-bold'>{participant.progress} km</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';

export default function EventCard({ event, onJoin, onWithdraw, onEdit, onDelete, isParticipant, userRole }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className='bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow border border-[#E2E8CE]'>
      <h3 className='text-xl font-bold text-[#262626] mb-2'>{event.title}</h3>
      <p className='text-[#262626] opacity-70 mb-4'>{event.description}</p>
      
      <div className='space-y-2 mb-4 text-sm text-[#262626] opacity-60'>
        <div>📍 {event.location}</div>
        <div>📅 {formatDate(event.eventDate)}</div>
        <div>🕐 {event.eventTime}</div>
        <div>👥 {event.currentParticipants}/{event.maxParticipants}</div>
        <div>📊 Status: <span className='capitalize'>{event.status}</span></div>
      </div>

      {/* Admin Actions */}
      {userRole === 'admin' && (
        <div className='space-y-2'>
          <button
            onClick={() => onEdit(event)}
            className='w-full py-2 bg-[#FF7F11] text-white rounded-lg 
              hover:opacity-90 transition-opacity font-medium'
          >
            ✏️ Edit Event
          </button>
          <button
            onClick={() => onDelete(event.eventId)}
            className='w-full py-2 bg-[#FF1B1C] text-white rounded-lg 
              hover:opacity-80 transition-opacity font-medium'
          >
            🗑️ Delete Event
          </button>
        </div>
      )}

      {/* User Actions (Non-Admin) */}
      {userRole !== 'admin' && (
        isParticipant ? (
          <button
            onClick={() => onWithdraw(event.eventId)}
            className='w-full py-2 bg-[#FF1B1C] text-white rounded-lg 
              hover:opacity-80 transition-opacity font-medium'
          >
            Withdraw
          </button>
        ) : (
          <button
            onClick={() => onJoin(event.eventId)}
            className='w-full py-2 bg-[#ACBFA4] text-[#262626] rounded-lg 
              hover:opacity-90 transition-opacity font-medium
              disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
            disabled={event.currentParticipants >= event.maxParticipants}
          >
            {event.currentParticipants >= event.maxParticipants ? 'Event Full' : 'Join Event'}
          </button>
        )
      )}
    </div>
  );
}
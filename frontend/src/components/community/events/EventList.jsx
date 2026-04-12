import React from 'react';
import EventCard from './EventCard';

export default function EventList({ 
  events, 
  onJoin, 
  onWithdraw, 
  onEdit, 
  onDelete,
  participantEventIds, 
  userRole 
}) {
  if (!events || events.length === 0) {
    return (
      <div className='text-center py-16 bg-white rounded-2xl border border-[#E2E8CE]'>
        <p className='text-[#262626] opacity-60 text-lg'>No events available yet</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {events.map((event) => (
        <EventCard
          key={event.eventId}
          event={event}
          onJoin={onJoin}
          onWithdraw={onWithdraw}
          onEdit={onEdit}
          onDelete={onDelete}
          isParticipant={participantEventIds?.includes(event.eventId)}
          userRole={userRole}
        />
      ))}
    </div>
  );
}
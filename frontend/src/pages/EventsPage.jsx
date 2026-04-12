import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, joinEvent, withdrawFromEvent, deleteEvent } from '../services/communityService';
import { useAuth } from '../context/AuthContext';
import EventList from '../components/community/events/EventList';
import CreateEventForm from '../components/community/events/CreateEventForm';
import EditEventForm from '../components/community/events/EditEventForm';

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (eventId) => {
    try {
      await joinEvent(eventId);
      alert('Successfully joined event! 🎉');
      fetchEvents();
    } catch (err) {
      console.error('Join event error:', err);
      alert(err.response?.data?.error || 'Failed to join event');
    }
  };

  const handleWithdraw = async (eventId) => {
    try {
      await withdrawFromEvent(eventId);
      alert('Withdrawn from event');
      fetchEvents();
    } catch (err) {
      console.error('Withdraw error:', err);
      alert(err.response?.data?.error || 'Failed to withdraw');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowEditForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(eventId);
        alert('Event deleted successfully');
        fetchEvents();
      } catch (err) {
        console.error('Delete error:', err);
        alert(err.response?.data?.error || 'Failed to delete event');
      }
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen pt-20 flex items-center justify-center bg-[#E2E8CE]'>
        <div className='text-[#ACBFA4] text-xl font-semibold'>Loading events...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pt-20 pb-8 px-6 bg-[#E2E8CE]'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-bold text-[#262626] mb-2'>📅 Community Events</h1>
            <p className='text-[#262626] opacity-70'>Join group rides and cycling meetups</p>
          </div>
          
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className='px-6 py-3 bg-[#ACBFA4] text-[#262626] rounded-lg 
                hover:opacity-90 transition-opacity font-semibold'
            >
              {showCreateForm ? 'Cancel' : '+ Create Event'}
            </button>
          )}
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <div className='mb-8'>
            <CreateEventForm onSuccess={fetchEvents} onCancel={() => setShowCreateForm(false)} />
          </div>
        )}

        {/* Edit Event Form */}
        {showEditForm && editingEvent && (
          <div className='mb-8'>
            <EditEventForm 
              event={editingEvent}
              onSuccess={fetchEvents} 
              onCancel={() => {
                setShowEditForm(false);
                setEditingEvent(null);
              }} 
            />
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className='text-center py-16 bg-white rounded-2xl border border-[#E2E8CE]'>
            <p className='text-[#262626] opacity-60 text-lg mb-4'>No events available yet</p>
            <button
              onClick={() => navigate('/community')}
              className='text-[#FF7F11] hover:underline font-semibold'
            >
              Back to Community Hub
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            <EventList
              events={events}
              onJoin={handleJoin}
              onWithdraw={handleWithdraw}
              onEdit={handleEdit}
              onDelete={handleDelete}
              userRole={user?.role}
            />
          </div>
        )}

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
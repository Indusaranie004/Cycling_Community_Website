import React, { useState, useEffect } from 'react';
import { updateEvent } from '../../../services/communityService';

export default function EditEventForm({ event, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    eventTime: '',
    maxParticipants: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill form with existing event data
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
        eventTime: event.eventTime || '',
        maxParticipants: event.maxParticipants || '',
        status: event.status || 'upcoming'
      });
    }
  }, [event]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateEvent(event.eventId, formData);
      alert('Event updated successfully! ✅');
      onSuccess();
      onCancel();
    } catch (err) {
      console.error('Update event error:', err);
      setError(err.response?.data?.error || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='bg-white rounded-2xl p-8 max-w-2xl mx-auto border border-[#E2E8CE]'>
      <h2 className='text-2xl font-bold text-[#262626] mb-6'>Edit Event</h2>
      
      {error && (
        <div className='bg-[#FF1B1C] bg-opacity-10 text-[#FF1B1C] p-3 rounded-lg mb-4'>
          {error}
        </div>
      )}

      <div className='space-y-4'>
        <div>
          <label className='block text-[#262626] font-semibold mb-2'>Title *</label>
          <input
            type='text'
            name='title'
            value={formData.title}
            onChange={handleChange}
            required
            className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
          />
        </div>

        <div>
          <label className='block text-[#262626] font-semibold mb-2'>Description *</label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            required
            rows='3'
            className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
          />
        </div>

        <div>
          <label className='block text-[#262626] font-semibold mb-2'>Location *</label>
          <input
            type='text'
            name='location'
            value={formData.location}
            onChange={handleChange}
            required
            className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-[#262626] font-semibold mb-2'>Date *</label>
            <input
              type='date'
              name='eventDate'
              value={formData.eventDate}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
            />
          </div>

          <div>
            <label className='block text-[#262626] font-semibold mb-2'>Time *</label>
            <input
              type='time'
              name='eventTime'
              value={formData.eventTime}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-[#262626] font-semibold mb-2'>Max Participants *</label>
            <input
              type='number'
              name='maxParticipants'
              value={formData.maxParticipants}
              onChange={handleChange}
              required
              min='1'
              className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
            />
          </div>

          <div>
            <label className='block text-[#262626] font-semibold mb-2'>Status</label>
            <select
              name='status'
              value={formData.status}
              onChange={handleChange}
              className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
            >
              <option value='upcoming'>Upcoming</option>
              <option value='ongoing'>Ongoing</option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className='flex gap-3 justify-end mt-6'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2 bg-[#E2E8CE] text-[#262626] rounded-lg font-semibold hover:opacity-80 transition-opacity'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={loading}
          className='px-6 py-2 bg-[#ACBFA4] text-[#262626] rounded-lg font-semibold 
            hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed'
        >
          {loading ? 'Updating...' : 'Update Event'}
        </button>
      </div>
    </form>
  );
}
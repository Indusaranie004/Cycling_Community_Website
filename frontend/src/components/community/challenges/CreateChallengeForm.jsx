import React, { useState } from 'react';
import { createChallenge } from '../../../services/communityService';

export default function CreateChallengeForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDistance: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createChallenge(formData);
      alert('Challenge created successfully! 🏆');
      onSuccess();
      onCancel();
    } catch (err) {
      console.error('Create challenge error:', err);
      setError(err.response?.data?.error || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='bg-white rounded-2xl p-8 max-w-2xl mx-auto border border-[#E2E8CE]'>
      <h2 className='text-2xl font-bold text-[#262626] mb-6'>Create New Challenge</h2>
      
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
            placeholder='e.g., 100km March Challenge'
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
            placeholder='Describe the challenge...'
            rows='3'
            className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
          />
        </div>

        <div>
          <label className='block text-[#262626] font-semibold mb-2'>Target Distance (km) *</label>
          <input
            type='number'
            name='targetDistance'
            value={formData.targetDistance}
            onChange={handleChange}
            required
            min='1'
            placeholder='e.g., 100'
            className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-[#262626] font-semibold mb-2'>Start Date *</label>
            <input
              type='date'
              name='startDate'
              value={formData.startDate}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
            />
          </div>

          <div>
            <label className='block text-[#262626] font-semibold mb-2'>End Date *</label>
            <input
              type='date'
              name='endDate'
              value={formData.endDate}
              onChange={handleChange}
              required
              min={formData.startDate}
              className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
            />
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
          {loading ? 'Creating...' : 'Create Challenge'}
        </button>
      </div>
    </form>
  );
}
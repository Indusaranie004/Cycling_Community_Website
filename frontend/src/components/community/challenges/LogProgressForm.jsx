import React, { useState } from 'react';
import { updateProgress } from '../../../services/communityService';

export default function LogProgressForm({ challengeId, onSuccess, userRole }) {
  const [distance, setDistance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Hide form completely for admins (no message shown)
  if (userRole === 'admin') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateProgress(challengeId, parseFloat(distance));
      alert('Progress logged successfully! 🚴‍♂️');
      setDistance('');
      onSuccess();
    } catch (err) {
      console.error('Log progress error:', err);
      setError(err.response?.data?.error || 'Failed to log progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='bg-white rounded-2xl p-6 mt-6 border border-[#E2E8CE]'>
      <h3 className='text-lg font-bold text-[#262626] mb-4'>Log Your Ride</h3>
      
      {error && (
        <div className='bg-[#FF1B1C] bg-opacity-10 text-[#FF1B1C] p-3 rounded-lg mb-4'>
          {error}
        </div>
      )}

      <div className='mb-4'>
        <label className='block text-[#262626] font-semibold mb-2'>Distance Cycled (km) *</label>
        <input
          type='number'
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          required
          min='0.1'
          step='0.1'
          placeholder='e.g., 25.5'
          className='w-full px-4 py-2 border border-[#E2E8CE] rounded-lg focus:outline-none focus:border-[#ACBFA4]'
        />
      </div>

      <button
        type='submit'
        disabled={loading || !distance}
        className='w-full py-2 bg-[#ACBFA4] text-[#262626] rounded-lg font-semibold 
          hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed'
      >
        {loading ? 'Logging...' : 'Log Progress'}
      </button>
    </form>
  );
}
import React, { useEffect, useState } from 'react';
import { getRouteFeedback } from '../../services/interactionService';

function StarDisplay({ rating }) {
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`text-base ${star <= rating ? 'text-brand-orange' : 'text-gray-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function RouteFeedbackModal({ route, token, onClose }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getRouteFeedback(route._id, token);
        setFeedback(data);
      } catch {
        setError('Failed to load feedback.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [route._id, token]);

  const avg = feedback.length
    ? Math.round((feedback.reduce((sum, f) => sum + f.intRating, 0) / feedback.length) * 10) / 10
    : null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0'>
          <div className='min-w-0'>
            <h2 className='text-sm font-bold text-brand-dark truncate'>Feedback</h2>
            <p className='text-xs text-gray-400 truncate mt-0.5'>{route.name}</p>
          </div>
          <button onClick={onClose} className='ml-4 text-gray-400 hover:text-brand-dark text-xl leading-none'>×</button>
        </div>

        {/* Average rating bar */}
        {avg !== null && (
          <div className='flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0'>
            <span className='text-2xl font-bold text-brand-dark'>{avg}</span>
            <StarDisplay rating={Math.round(avg)} />
            <span className='text-xs text-gray-400 ml-1'>
              {feedback.length} review{feedback.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* List */}
        <div className='flex-1 overflow-y-auto divide-y divide-gray-100'>
          {loading && (
            <p className='text-sm text-gray-400 text-center py-10'>Loading...</p>
          )}
          {error && (
            <p className='text-sm text-red-400 text-center py-10'>{error}</p>
          )}
          {!loading && !error && feedback.length === 0 && (
            <p className='text-sm text-gray-400 text-center py-10'>No feedback yet for this route.</p>
          )}
          {!loading && !error && feedback.map(item => (
            <div key={item._id} className='px-5 py-3 flex flex-col gap-1'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-semibold text-brand-dark'>
                  {item.userId?.name || 'Anonymous'}
                </span>
                <span className='text-xs text-gray-400'>
                  {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <StarDisplay rating={item.intRating} />
              {item.intDescription && (
                <p className='text-xs text-gray-600 leading-relaxed'>{item.intDescription}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
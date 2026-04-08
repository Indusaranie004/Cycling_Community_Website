import React from 'react';

export default function CreateModeStats({ stats }) {
  if (!stats) return null;

  const fmt = (m) => (m / 1000).toFixed(1) + ' km';
  const fmtTime = (min) => `${Math.round(min)} min`;

  return (
    <div className='absolute top-16 left-1/2 -translate-x-1/2 z-10
      bg-brand-dark/90 backdrop-blur-sm
      text-brand-cream rounded-full px-6 py-2
      flex items-center gap-6 shadow-lg text-sm'>
      <span>
        <span className='font-bold text-brand-sage'>{fmt(stats.distance)}</span>
        <span className='text-xs ml-1 text-gray-400'>distance</span>
      </span>
      <span className='text-gray-600'>|</span>
      <span>
        <span className='font-bold text-brand-orange'>{fmtTime(stats.estimatedTime)}</span>
        <span className='text-xs ml-1 text-gray-400'>est. time</span>
      </span>
    </div>
  );
}
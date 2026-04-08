import React from 'react';

const FILTERS = [
  { key: 'public', label: 'All Public', dot: '#ACBFA4' },
  { key: 'myRoutes', label: 'My Routes', dot: '#4A90D9' },
  { key: 'nearby', label: 'Nearby', dot: '#FF7F11' },
  { key: 'saved', label: 'Saved', dot: '#FF1B1C' },
];

export default function FilterPanel({ activeFilter, onChange }) {
  return (
    <div className='absolute top-20 right-4 z-10
      bg-brand-dark/90 backdrop-blur-sm
      rounded-xl shadow-lg p-3 flex flex-col gap-2'>
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-colors text-left
            ${activeFilter === f.key
              ? 'bg-brand-cream text-brand-dark'
              : 'text-brand-cream hover:bg-white/10'}`}
        >
          <span
            className='w-2.5 h-2.5 rounded-full flex-shrink-0'
            style={{ backgroundColor: f.dot }}
          />
          {f.label}
        </button>
      ))}
    </div>
  );
}
import React, { useState } from 'react';

const FILTERS = [
  { key: 'myRoutes', label: 'My Routes' },
  { key: 'saved',    label: 'Saved'     },
];

export default function FilterPanel({ activeFilter, onChange, variant = 'dropdown', counts = {} }) {
  const [open, setOpen] = useState(false);

  const handleToggle = (key) => {
    onChange(activeFilter === key ? 'public' : key);
  };

  const handleClear = () => {
    onChange('public');
  };

  const isFiltered = activeFilter !== 'public';

  if (variant === 'inline') {
    const chips = [
      { key: 'public', label: 'All Routes' },
      ...FILTERS,
    ];

    return (
      <div className='space-y-3'>
        <div className='flex flex-wrap gap-2'>
          {chips.map(chip => {
            const active = activeFilter === chip.key;
            const count = counts[chip.key] ?? 0;

            return (
              <button
                key={chip.key}
                onClick={() => onChange(chip.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border transition-colors
                  ${active
                    ? 'bg-brand-dark text-brand-cream border-brand-dark'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-orange hover:text-brand-orange'}`}
              >
                <span>{chip.label}</span>
                <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-bold
                  ${active ? 'bg-white/20 text-brand-cream' : 'bg-brand-dark/10 text-brand-dark'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {isFiltered && (
          <div className='flex justify-end pr-2'>
            <button
              type='button'
              onClick={handleClear}
              className='text-sm font-medium text-blue-600 hover:text-brand-orange transition-colors'
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Trigger button — top right, shows active state indicator */}
      <div className='relative z-10'>
        <button
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            shadow-lg transition-colors
            ${open || isFiltered
              ? 'bg-brand-cream text-brand-dark hover:bg-brand-orange/20 hover:text-brand-orange'
              : 'bg-brand-dark/80 backdrop-blur-sm text-brand-cream hover:bg-brand-orange hover:text-brand-cream'}`}
        >
          {/* Sliders icon */}
          <svg width='16' height='16' viewBox='0 0 16 16' fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <line x1='2' y1='4' x2='14' y2='4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
            <line x1='2' y1='8' x2='14' y2='8' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
            <line x1='2' y1='12' x2='14' y2='12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
            <circle cx='5' cy='4' r='2' fill='currentColor'/>
            <circle cx='10' cy='8' r='2' fill='currentColor'/>
            <circle cx='6' cy='12' r='2' fill='currentColor'/>
          </svg>
          Filters
          {isFiltered && (
            <span className='w-2 h-2 rounded-full bg-brand-orange flex-shrink-0' />
          )}
        </button>

        {/* Dropdown card */}
        {open && (
          <div className='absolute top-12 right-0 z-20 w-56
            bg-white rounded-2xl shadow-2xl p-4'>
            {/* Card header */}
            <div className='flex items-center justify-between mb-4'>
              <p className='font-bold text-brand-dark text-sm'>Filter Routes</p>
              <button
                onClick={() => setOpen(false)}
                className='text-gray-400 hover:text-brand-orange transition-colors text-lg leading-none'
              >
                ×
              </button>
            </div>

            {/* Radio-style options */}
            <div className='space-y-3'>
              {FILTERS.map(f => {
                const isActive = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => handleToggle(f.key)}
                    className='w-full flex items-center gap-3 text-left group'
                  >
                    {/* Radio circle */}
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center
                      justify-center flex-shrink-0 transition-colors
                      ${isActive
                        ? 'border-brand-dark bg-brand-dark'
                        : 'border-gray-300 group-hover:border-brand-orange'}`}>
                      {isActive && (
                        <span className='w-2 h-2 rounded-full bg-white' />
                      )}
                    </span>
                    <span className={`text-sm font-medium transition-colors
                      ${isActive ? 'text-brand-dark' : 'text-gray-500 group-hover:text-brand-orange'}`}>
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Clear button — only visible when a filter is active */}
            {isFiltered && (
              <button
                onClick={() => { handleClear(); setOpen(false); }}
                className='mt-4 w-full py-2 rounded-xl text-xs font-semibold
                  border border-gray-200 text-gray-500
                  hover:border-brand-orange hover:text-brand-orange transition-colors'
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
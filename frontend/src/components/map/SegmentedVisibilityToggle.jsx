import React from 'react';

/**
 * Two equal halves (grid) so Public / Private never overlap; #262626 track + orange thumb.
 */
export default function SegmentedVisibilityToggle({
  isPublic,
  onChange,
  idPrefix = 'route-visibility',
  className = 'w-full',
  labelClassName = '',
}) {
  return (
    <div className={className}>
      <span
        className={`mb-1.5 block text-xs font-medium text-brand-dark/70 ${labelClassName}`.trim()}
        id={`${idPrefix}-label`}
      >
        Visibility
      </span>
      <div
        className='relative h-11 w-full rounded-full bg-[#262626] p-1
          shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] ring-1 ring-white/10'
        role='tablist'
        aria-labelledby={`${idPrefix}-label`}
      >
        <div
          className='pointer-events-none absolute inset-y-1 left-1 z-0 w-[calc(50%-6px)] rounded-full bg-brand-orange
            shadow-[0_2px_10px_rgba(255,127,17,0.5),0_1px_4px_rgba(38,38,38,0.25)]
            transition-transform duration-200 ease-out'
          style={{
            transform: isPublic ? 'translateX(0)' : 'translateX(calc(100% + 4px))',
          }}
          aria-hidden
        />
        <div className='relative z-10 grid h-full w-full grid-cols-2'>
          <button
            type='button'
            role='tab'
            aria-selected={isPublic}
            id={`${idPrefix}-public`}
            className={`flex min-w-0 items-center justify-center rounded-full px-2 text-sm
              transition-colors duration-200
              ${isPublic ? 'font-bold text-white' : 'font-semibold text-brand-cream/80'}`}
            onClick={() => onChange(true)}
          >
            Public
          </button>
          <button
            type='button'
            role='tab'
            aria-selected={!isPublic}
            id={`${idPrefix}-private`}
            className={`flex min-w-0 items-center justify-center rounded-full px-2 text-sm
              transition-colors duration-200
              ${!isPublic ? 'font-bold text-white' : 'font-semibold text-brand-cream/80'}`}
            onClick={() => onChange(false)}
          >
            Private
          </button>
        </div>
      </div>
    </div>
  );
}

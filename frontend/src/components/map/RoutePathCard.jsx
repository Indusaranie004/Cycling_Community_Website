import React from 'react';

/** Start → end summary — dark green origin / #262626 destination (same as map pins). */
export default function RoutePathCard({ startLabel, endLabel }) {
  return (
    <div className='bg-gray-50 rounded-2xl border border-gray-100 p-4'>
      <p className='mb-2 text-xs font-normal uppercase tracking-wide text-gray-400'>Route</p>
      <div className='flex items-start gap-2'>
        <span className='mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-800' />
        <p className='break-words text-sm leading-snug text-brand-dark'>{startLabel}</p>
      </div>
      <div className='ml-1 my-1 h-4 border-l-2 border-dashed border-gray-300' />
      <div className='flex items-start gap-2'>
        <span className='mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-dark' />
        <p className='break-words text-sm leading-snug text-brand-dark'>{endLabel}</p>
      </div>
    </div>
  );
}

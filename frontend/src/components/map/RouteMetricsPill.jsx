import React from 'react';
import { formatDurationMinutes } from '../../utils/timeFormat';

/**
 * Two stat boxes: same fill as primary buttons (brand-dark + shadow); labels keep sage / orange.
 */
export default function RouteMetricsPill({ distanceMeters, estimatedTimeMinutes }) {
  const km = (Number(distanceMeters) / 1000).toFixed(1) + ' km';

  const boxClass =
    'rounded-xl bg-brand-dark p-4 text-center shadow-sm border border-white/10';

  return (
    <div className='grid w-full grid-cols-2 gap-3'>
      <div className={boxClass}>
        <p className='text-2xl font-bold leading-tight text-brand-cream'>{km}</p>
        <p className='mt-1 text-xs font-medium text-brand-sage'>Distance</p>
      </div>
      <div className={boxClass}>
        <p className='text-2xl font-bold leading-tight text-brand-cream'>
          {formatDurationMinutes(estimatedTimeMinutes)}
        </p>
        <p className='mt-1 text-xs font-medium text-brand-orange'>Est. Time</p>
      </div>
    </div>
  );
}

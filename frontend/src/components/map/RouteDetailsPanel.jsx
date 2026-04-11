import React, { useState } from 'react';
import { formatDurationMinutes } from '../../utils/timeFormat';

export default function RouteDetailsPanel({
  route, userId, isSaved, onToggleSave, onDelete, onClose
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwner = route.userId === userId;

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await onDelete(route._id);
  };

  const fmt = (m) => (m / 1000).toFixed(1) + ' km';
  const fmtTime = formatDurationMinutes;

  return (
    <div className='absolute top-14 right-0 bottom-0 z-10 w-80
      bg-brand-cream shadow-2xl flex flex-col
      translate-x-0 transition-transform'>
      {/* Header */}
      <div className='flex items-center justify-between p-4
        bg-brand-dark text-brand-cream'>
        <h2 className='font-semibold text-base truncate flex-1'>{route.name}</h2>
        <button onClick={onClose} className='ml-2 text-xl leading-none hover:text-brand-orange transition-colors'>
          ×
        </button>
      </div>
      {/* Body */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {/* Locations */}
        <div>
          <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Route</p>
          <p className='text-sm text-brand-dark'>{route.startLocation}</p>
          <p className='text-xs text-gray-400 my-0.5'>↓</p>
          <p className='text-sm text-brand-dark'>{route.endLocation}</p>
        </div>
        {/* Stats */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='bg-white rounded-lg p-3 text-center'>
            <p className='text-xl font-bold text-brand-dark'>{fmt(route.distance)}</p>
            <p className='text-xs text-gray-500'>Distance</p>
          </div>
          <div className='bg-white rounded-lg p-3 text-center'>
            <p className='text-xl font-bold text-brand-dark'>{fmtTime(route.estimatedTime)}</p>
            <p className='text-xs text-gray-500'>Est. Time</p>
          </div>
        </div>
        {/* Badges */}
        <div className='flex gap-2'>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border
            ${route.isPublic
              ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
              : 'bg-rose-50 text-rose-600 border-rose-300'}`}>
            {route.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
      {/* Actions */}
      <div className='p-4 border-t border-gray-200 space-y-2'>
        <button
          onClick={() => onToggleSave(route._id)}
          className='w-full py-2 rounded-lg text-sm font-semibold transition-colors
            bg-brand-dark text-brand-cream hover:bg-brand-orange hover:text-brand-cream'
        >
          {isSaved ? 'Unsave Route' : 'Save Route'}
        </button>
        {isOwner && (
          <button
            onClick={handleDelete}
            className='w-full py-2 rounded-lg text-sm font-semibold transition-colors
              bg-brand-red text-white hover:bg-brand-orange hover:text-white'
          >
            {confirmDelete ? 'Confirm Delete?' : 'Delete Route'}
          </button>
        )}
      </div>
    </div>
  );
}
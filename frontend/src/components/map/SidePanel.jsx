import React, { useState } from 'react';

export default function SidePanel({
  view,
  nearbyRoutes,
  selectedRoute,
  userId,
  savedRouteIds,
  hasNearbyList,
  onSelectRoute,
  onBackToList,
  onToggleSave,
  onDelete,
  onUpdate,
  onClose,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = selectedRoute && selectedRoute.userId === userId;
  const isSaved = selectedRoute && savedRouteIds.has(selectedRoute._id);

  const fmt = (m) => (m / 1000).toFixed(1) + ' km';
  const fmtTime = (min) => `${Math.round(min)} min`;

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await onDelete(selectedRoute._id);
    setConfirmDelete(false);
  };

  return (
    <div className='absolute top-4 left-4 bottom-4 z-20 w-80
      flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden'>

      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3
        bg-brand-dark text-brand-cream flex-shrink-0'>
        <div className='flex items-center gap-2 min-w-0'>
          {/* Back arrow — only shown in detail view when a list exists to return to */}
          {view === 'detail' && hasNearbyList && (
            <button
              onClick={onBackToList}
              className='text-brand-sage hover:text-brand-cream transition-colors
                text-lg leading-none flex-shrink-0'
              title='Back to list'
            >
              ←
            </button>
          )}
          <h2 className='font-semibold text-sm truncate'>
            {view === 'detail' && selectedRoute
              ? selectedRoute.name
              : `Nearby Routes (${nearbyRoutes.length})`}
          </h2>
        </div>
        <button
          onClick={onClose}
          className='ml-2 text-xl leading-none hover:opacity-70 flex-shrink-0'
        >
          ×
        </button>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className='flex-1 overflow-y-auto p-3 space-y-2'>
          {nearbyRoutes.length === 0 ? (
            <p className='text-sm text-gray-400 text-center mt-12 px-4'>
              No routes found nearby.
              <br />
              <span className='text-xs mt-1 block'>Try searching from a different location.</span>
            </p>
          ) : (
            nearbyRoutes.map(route => (
              <button
                key={route._id}
                onClick={() => onSelectRoute(route)}
                className='w-full text-left bg-gray-50 hover:bg-brand-sage/20
                  rounded-xl p-3 transition-colors border border-gray-100
                  hover:border-brand-sage/40 group'
              >
                <p className='text-sm font-semibold text-brand-dark truncate
                  group-hover:text-brand-dark'>
                  {route.name}
                </p>
                <p className='text-xs text-gray-400 mt-0.5 truncate'>
                  {route.startLocation || 'Start'} → {route.endLocation || 'End'}
                </p>
                <div className='flex items-center gap-2 mt-2'>
                  <span className='text-xs font-medium text-brand-dark'>
                    {fmt(route.distance)}
                  </span>
                  <span className='text-gray-300 text-xs'>·</span>
                  <span className='text-xs text-gray-400'>
                    {fmtTime(route.estimatedTime)}
                  </span>
                  <span className='text-gray-300 text-xs'>·</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                    ${route.isPublic
                      ? 'bg-brand-sage/25 text-brand-dark'
                      : 'bg-gray-200 text-gray-500'}`}>
                    {route.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Detail View */}
      {view === 'detail' && selectedRoute && (
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* Scrollable body */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>

            {/* Visibility badge — immediately below name (which is in header) */}
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                ${selectedRoute.isPublic
                  ? 'bg-brand-sage/30 text-brand-dark'
                  : 'bg-gray-200 text-gray-600'}`}>
                {selectedRoute.isPublic ? 'Public' : 'Private'}
              </span>
            </div>

            {/* Origin and Destination */}
            <div className='bg-gray-50 rounded-xl p-3'>
              <p className='text-xs text-gray-400 uppercase tracking-wide mb-2'>Route</p>
              <div className='flex items-start gap-2'>
                <span className='w-2.5 h-2.5 rounded-full bg-brand-sage mt-1 flex-shrink-0' />
                <p className='text-sm text-brand-dark leading-snug break-words'>
                  {selectedRoute.startLocation || 'Start point'}
                </p>
              </div>
              <div className='ml-1 my-1 border-l-2 border-dashed border-gray-300 h-4' />
              <div className='flex items-start gap-2'>
                <span className='w-2.5 h-2.5 rounded-full bg-brand-orange mt-1 flex-shrink-0' />
                <p className='text-sm text-brand-dark leading-snug break-words'>
                  {selectedRoute.endLocation || 'End point'}
                </p>
              </div>
            </div>

            {/* Distance and estimated time */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='bg-gray-50 rounded-xl p-3 text-center'>
                <p className='text-lg font-bold text-brand-dark'>
                  {fmt(selectedRoute.distance)}
                </p>
                <p className='text-xs text-gray-400 mt-0.5'>Distance</p>
              </div>
              <div className='bg-gray-50 rounded-xl p-3 text-center'>
                <p className='text-lg font-bold text-brand-dark'>
                  {fmtTime(selectedRoute.estimatedTime)}
                </p>
                <p className='text-xs text-gray-400 mt-0.5'>Est. Time</p>
              </div>
            </div>
          </div>

          {/* Action buttons — pinned to bottom, not scrollable */}
          <div className='p-4 border-t border-gray-100 space-y-2 flex-shrink-0'>
            <button
              onClick={() => onToggleSave(selectedRoute._id)}
              className='w-full py-2.5 rounded-xl text-sm font-semibold transition-colors
                bg-brand-dark text-brand-cream
                hover:bg-brand-sage hover:text-brand-dark'
            >
              {isSaved ? 'Unsave Route' : 'Save Route'}
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => onUpdate(selectedRoute)}
                  className='w-full py-2.5 rounded-xl text-sm font-semibold transition-colors
                    border-2 border-brand-dark text-brand-dark
                    hover:bg-brand-sage/20 hover:border-brand-sage'
                >
                  Update Route
                </button>
                <button
                  onClick={handleDelete}
                  className='w-full py-2.5 rounded-xl text-sm font-semibold transition-colors
                    bg-brand-red text-white hover:opacity-80'
                >
                  {confirmDelete ? 'Confirm Delete?' : 'Delete Route'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
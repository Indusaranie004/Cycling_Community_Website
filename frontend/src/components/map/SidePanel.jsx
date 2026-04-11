import React, { useState } from 'react';
import { formatDurationMinutes } from '../../utils/timeFormat';

function VisibilityBadge({ isPublic }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
      ${isPublic ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isPublic ? 'Public' : 'Private'}
    </span>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className='bg-gray-50 rounded-2xl p-4 text-center border border-gray-100'>
      <p className='text-3xl font-bold text-brand-dark leading-tight'>{value}</p>
      <p className='text-xs text-gray-400 mt-1'>{label}</p>
    </div>
  );
}

function PanelButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`w-full py-3 rounded-2xl text-sm font-semibold transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function RouteCard({ route, onSelectRoute, fmt, fmtTime }) {
  return (
    <button
      onClick={() => onSelectRoute(route)}
      className='w-full text-left bg-gray-50 hover:bg-brand-sage/15 rounded-2xl p-4
        transition-colors border border-gray-100 hover:border-brand-sage/40'
    >
      <div className='flex items-start justify-between gap-2'>
        <p className='text-sm font-semibold text-brand-dark truncate'>{route.name}</p>
        <VisibilityBadge isPublic={route.isPublic} />
      </div>
      <p className='text-xs text-gray-400 mt-1 truncate'>
        {route.startLocation || 'Start'} -> {route.endLocation || 'End'}
      </p>
      <div className='flex items-center gap-2 mt-3'>
        <span className='text-xs font-semibold text-brand-dark'>{fmt(route.distance)}</span>
        <span className='text-gray-300 text-xs'>|</span>
        <span className='text-xs text-gray-400'>{fmtTime(route.estimatedTime)}</span>
      </div>
    </button>
  );
}

export default function SidePanel({
  view,
  routesList,
  listTitle = 'Routes',
  emptyMessage = 'No routes found.',
  selectedRoute,
  isEditing,
  editDraft,
  liveStats,
  userId,
  savedRouteIds,
  hasList,
  onSelectRoute,
  onBackToList,
  onToggleSave,
  onDelete,
  onUpdate,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
  onClose,
  onAddFeedback,
  onViewFeedback,
  embedded = false,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = selectedRoute && selectedRoute.userId === userId;
  const isSaved = selectedRoute && savedRouteIds.has(selectedRoute._id);

  const fmt = (m) => (m / 1000).toFixed(1) + ' km';
  const fmtTime = formatDurationMinutes;
  const scrollablePanelClass = 'panel-scrollbar';
  const panelTitle = view === 'detail' && selectedRoute
    ? selectedRoute.name
    : `${listTitle} (${routesList.length})`;
  const detailDistance = isEditing && liveStats ? liveStats.distance : selectedRoute?.distance;
  const detailTime = isEditing && liveStats ? liveStats.estimatedTime : selectedRoute?.estimatedTime;
  const canSubmitEdit = !!editDraft?.name?.trim();

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await onDelete(selectedRoute._id);
    setConfirmDelete(false);
  };

  return (
    <div className={`${embedded
      ? 'w-full h-full'
      : 'w-80 max-h-[calc(100vh-7.5rem)] shadow-2xl rounded-3xl border border-gray-200'}
      flex flex-col bg-white overflow-hidden`}>

      {/* Header */}
      <div className={`${embedded ? '' : 'drag-handle cursor-move select-none'}
        flex items-center justify-between px-4 py-4 flex-shrink-0
        ${embedded ? 'bg-gray-50 text-brand-dark border-b border-gray-100' : 'bg-brand-dark text-brand-cream'}`}>
        <div className='flex items-center gap-2 min-w-0'>
          {view === 'detail' && hasList && (
            <button
              onClick={onBackToList}
              className={`${embedded
                ? 'text-brand-dark/70 hover:text-brand-dark'
                : 'text-brand-sage hover:text-brand-cream'}
                transition-colors text-xl leading-none flex-shrink-0`}
              title='Back to list'
            >
              ←
            </button>
          )}
          <h2 className='font-semibold text-sm truncate'>{panelTitle}</h2>
        </div>
        <button
          onClick={onClose}
          className={`ml-2 text-xl leading-none hover:opacity-70 flex-shrink-0
            ${embedded ? 'text-gray-500' : 'text-brand-cream/90'}`}
        >
          ×
        </button>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className={`flex-1 overflow-y-scroll p-3 space-y-3 bg-white ${scrollablePanelClass}`}>
          {routesList.length === 0 ? (
            <p className='text-sm text-gray-400 text-center mt-12 px-4'>
              {emptyMessage}
            </p>
          ) : (
            routesList.map(route => (
              <RouteCard
                key={route._id}
                route={route}
                onSelectRoute={onSelectRoute}
                fmt={fmt}
                fmtTime={fmtTime}
              />
            ))
          )}
        </div>
      )}

      {/* Detail View */}
      {view === 'detail' && selectedRoute && (
        <div className='flex-1 flex flex-col overflow-hidden'>
          <div className={`flex-1 overflow-y-scroll p-4 space-y-4 bg-white ${scrollablePanelClass}`}>
            {isEditing ? (
              <>
                <div className='bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3'>
                  <div>
                    <label className='text-xs text-gray-500 block mb-1'>Route name</label>
                    <input
                      type='text'
                      value={editDraft?.name || ''}
                      onChange={(e) => onEditDraftChange(prev => ({ ...prev, name: e.target.value }))}
                      className='w-full rounded-xl border border-gray-200 px-3 py-2 text-sm
                        text-brand-dark focus:outline-none focus:border-brand-sage'
                      placeholder='Route name'
                    />
                  </div>
                  <div>
                    <label className='text-xs text-gray-500 block mb-1'>Origin</label>
                    <input
                      type='text'
                      value={editDraft?.startLocation || ''}
                      onChange={(e) => onEditDraftChange(prev => ({ ...prev, startLocation: e.target.value }))}
                      className='w-full rounded-xl border border-gray-200 px-3 py-2 text-sm
                        text-brand-dark focus:outline-none focus:border-brand-sage'
                      placeholder='Start location'
                    />
                  </div>
                  <div>
                    <label className='text-xs text-gray-500 block mb-1'>Destination</label>
                    <input
                      type='text'
                      value={editDraft?.endLocation || ''}
                      onChange={(e) => onEditDraftChange(prev => ({ ...prev, endLocation: e.target.value }))}
                      className='w-full rounded-xl border border-gray-200 px-3 py-2 text-sm
                        text-brand-dark focus:outline-none focus:border-brand-sage'
                      placeholder='End location'
                    />
                  </div>
                  <div className='flex items-center gap-2 pt-1'>
                    {['Public', 'Private'].map(opt => {
                      const nextPublic = opt === 'Public';
                      const active = !!editDraft?.isPublic === nextPublic;
                      return (
                        <button
                          key={opt}
                          type='button'
                          onClick={() => onEditDraftChange(prev => ({ ...prev, isPublic: nextPublic }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                            ${active
                              ? 'bg-brand-sage text-brand-dark'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <VisibilityBadge isPublic={selectedRoute.isPublic} />
              </div>
            )}

            <div className='bg-gray-50 rounded-2xl p-4 border border-gray-100'>
              <p className='text-xs text-gray-400 uppercase tracking-wide mb-2'>Route</p>
              <div className='flex items-start gap-2'>
                <span className='w-2.5 h-2.5 rounded-full bg-brand-sage mt-1 flex-shrink-0' />
                <p className='text-sm text-brand-dark leading-snug break-words'>
                  {(isEditing ? editDraft?.startLocation : selectedRoute.startLocation) || 'Start point'}
                </p>
              </div>
              <div className='ml-1 my-1 border-l-2 border-dashed border-gray-300 h-4' />
              <div className='flex items-start gap-2'>
                <span className='w-2.5 h-2.5 rounded-full bg-brand-orange mt-1 flex-shrink-0' />
                <p className='text-sm text-brand-dark leading-snug break-words'>
                  {(isEditing ? editDraft?.endLocation : selectedRoute.endLocation) || 'End point'}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <MetricCard label='Distance' value={fmt(detailDistance || 0)} />
              <MetricCard label='Est. Time' value={fmtTime(detailTime || 0)} />
            </div>
          </div>

          <div className='p-4 border-t border-gray-100 space-y-3 flex-shrink-0 bg-white'>
            {isEditing ? (
              <>
                <PanelButton
                  onClick={onSaveEdit}
                  disabled={!canSubmitEdit}
                  className='bg-brand-dark text-brand-cream hover:bg-brand-sage hover:text-brand-dark disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Save Updated Route
                </PanelButton>
                <PanelButton
                  onClick={onCancelEdit}
                  className='border-2 border-brand-dark text-brand-dark hover:bg-brand-sage/20 hover:border-brand-sage'
                >
                  Cancel Update
                </PanelButton>
              </>
            ) : (
              <>
                <PanelButton
  onClick={() => onToggleSave(selectedRoute._id)}
  className='bg-brand-dark text-brand-cream hover:bg-brand-sage hover:text-brand-dark'
>
  {isSaved ? 'Unsave Route' : 'Save Route'}
</PanelButton>
<PanelButton
  onClick={() => onAddFeedback(selectedRoute)}
  className='border-2 border-brand-sage text-brand-dark hover:bg-brand-sage/20'
>
  💬 Add Feedback
</PanelButton>

<PanelButton
  onClick={() => onViewFeedback(selectedRoute)}
  className='border-2 border-gray-200 text-brand-dark hover:bg-gray-50'
>
  ⭐ View Feedback
</PanelButton>
{isOwner && (
                  <>
                    <PanelButton
                      onClick={() => onUpdate(selectedRoute)}
                      className='border-2 border-brand-dark text-brand-dark hover:bg-brand-sage/20 hover:border-brand-sage'
                    >
                      Update Route
                    </PanelButton>
                    <PanelButton
                      onClick={handleDelete}
                      className='bg-brand-red text-white hover:opacity-80'
                    >
                      {confirmDelete ? 'Confirm Delete?' : 'Delete Route'}
                    </PanelButton>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
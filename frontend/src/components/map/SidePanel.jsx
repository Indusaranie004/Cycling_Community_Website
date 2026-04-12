import React, {useState} from 'react';
import { formatDurationMinutes } from '../../utils/timeFormat';
import PrimaryBrandButton from '../shared/PrimaryBrandButton';
import RoutePathCard from './RoutePathCard';
import RouteMetricsPill from './RouteMetricsPill';

function VisibilityBadge({ isPublic }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
      ${isPublic
        ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
        : 'bg-rose-50 text-rose-600 border-rose-300'}`}>
      {isPublic ? 'Public' : 'Private'}
    </span>
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
      className='w-full text-left bg-gray-50 hover:bg-brand-orange/10 rounded-2xl p-4
        transition-colors border border-gray-100 hover:border-brand-orange/50'
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
  canSubmitEdit = true, 
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
    : '';

    const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await onDelete(selectedRoute._id);
    setConfirmDelete(false);
  };
  const handleDeleteClick = () => {
    onDelete(selectedRoute._id);
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
                ? 'text-brand-dark/70 hover:text-brand-orange'
                : 'text-brand-sage hover:text-brand-orange'}
                transition-colors text-xl leading-none flex-shrink-0`}
              title='Back to list'
            >
              ←
            </button>
          )}
          {panelTitle && (
            <h2 className='font-semibold text-sm truncate'>{panelTitle}</h2>
          )}
        </div>
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
              <p className='text-sm text-gray-500 leading-relaxed'>
                Adjust the route on the map, then save or cancel using the form above.
              </p>
            ) : (
              <>
                <div>
                  <VisibilityBadge isPublic={selectedRoute.isPublic} />
                </div>
                <RoutePathCard
                  startLabel={selectedRoute.startLocation || 'Start point'}
                  endLabel={selectedRoute.endLocation || 'End point'}
                />
                <RouteMetricsPill
                  distanceMeters={selectedRoute?.distance ?? 0}
                  estimatedTimeMinutes={selectedRoute?.estimatedTime ?? 0}
                />
              </>
            )}
          </div>
{/* //////////////////////////////////////////////////////// */}
          {/* //////////////////////////////////////////////////////// */}
          <div className='p-4 border-t border-gray-100 space-y-3 flex-shrink-0 bg-white'>
            {isEditing ? (
              /* 1. Buttons shown ONLY when editing */
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
              /* 2. Buttons shown when viewing (NOT editing) */
              <>
                {/* Main Save Action */}
                <PrimaryBrandButton
                  onClick={() => onToggleSave(selectedRoute._id)}
                  className={`w-full py-3 !rounded-2xl ${!isOwner ? '!bg-[#FF7F11] hover:!bg-[#e67310]' : ''}`}
                >
                  {isSaved ? 'Unsave Route' : 'Save Route'}
                </PrimaryBrandButton>

                {/* Feedback Actions (Side by Side) */}
                <div className="grid grid-cols-2 gap-2">
                  <PanelButton
                    onClick={() => onAddFeedback(selectedRoute)}
                    className='border-2 border-brand-sage text-brand-dark hover:bg-brand-sage/20'
                  >
                    Give Feedback
                  </PanelButton>
                  <PanelButton
                    onClick={() => onViewFeedback(selectedRoute)}
                    className='border-2 border-gray-200 text-brand-dark hover:bg-gray-50'
                  >
                    View Feedbacks
                  </PanelButton>
                </div>

                {/* Owner Only Actions */}
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
{/* ///////////////////////////////////////////////////////////////////////// */}
          {/* ///////////////////////////////////////////////////////////////////////// */}
        </div>
      )}
    </div>
  );
}
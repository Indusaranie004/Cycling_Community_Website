import React, { useState, useCallback, useEffect, useRef } from 'react';
import ConfirmAlert from '../components/shared/ConfirmAlert';
import { useAuth } from '../context/AuthContext';
import * as routeSvc from '../services/routeService';
import * as favSvc from '../services/favouriteService';
import MapContainer from '../components/map/MapContainer';
import FilterPanel from '../components/map/FilterPanel';
import SidePanel from '../components/map/SidePanel';
import SaveRouteForm from '../components/map/SaveRouteForm';
import CreateInteraction from '../components/interactions/CreateInteraction';
import { createInteraction, getActiveHazards, getRouteFeedback } from '../services/interactionService';
import RouteFeedbackModal from '../components/interactions/RouteFeedbackModal';
import PrimaryBrandButton from '../components/shared/PrimaryBrandButton';

const EARTH_RADIUS_KM = 6371;
const CYCLING_SPEED_KMH = 18;

function haversineKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateRouteStats(coords) {
  if (!coords || coords.length < 2) return { distance: 0, estimatedTime: 0 };
  const distanceKm = coords.slice(1).reduce((acc, curr, idx) => (
    acc + haversineKm(coords[idx], curr)
  ), 0);
  return {
    distance: distanceKm * 1000,
    estimatedTime: (distanceKm / CYCLING_SPEED_KMH) * 60,
  };
}



function DraggableOverlay({
  initialX,
  initialY,
  zIndex = 10,
  className = '',
  children,
  handleSelector,
}) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    startLeft: initialX,
    startTop: initialY,
  });
  const overlayRef = useRef(null);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const canStartDrag = useCallback((event) => {
    const interactiveTarget = event.target.closest('button, a, input, textarea, select, [role="button"]');
    if (interactiveTarget) return false;
    if (!handleSelector || !overlayRef.current) return true;
    const handleEl = event.target.closest(handleSelector);
    return !!handleEl && overlayRef.current.contains(handleEl);
  }, [handleSelector]);

  const onPointerDown = useCallback((event) => {
    if (!canStartDrag(event)) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: position.x,
      startTop: position.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [canStartDrag, position.x, position.y]);

  const onPointerMove = useCallback((event) => {
    if (!dragging || dragRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.startLeft + deltaX,
      y: dragRef.current.startTop + deltaY,
    });
  }, [dragging]);

  const stopDrag = useCallback((event) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    setDragging(false);
    dragRef.current.pointerId = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className={`absolute ${className}`}
      style={{ left: position.x, top: position.y, zIndex }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      {children}
    </div>
  );
}

export default function MapPage() {
  const { userId, token } = useAuth();
  const [mode, setMode] = useState('display');
  const [activeFilter, setActiveFilter] = useState('public');
  const [filterCounts, setFilterCounts] = useState({ public: 0, myRoutes: 0, saved: 0 });
  const [routes, setRoutes] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [savedRouteIds, setSavedRouteIds] = useState(new Set());
  const [liveStats, setLiveStats] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [focusCoordinates, setFocusCoordinates] = useState(null);
  const [zoom, setZoom] = useState(10);

  // Side panel state
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [stackCollapsed, setStackCollapsed] = useState(false);
  const [sidePanelView, setSidePanelView] = useState('list');
  const [nearbyRoutes, setNearbyRoutes] = useState([]);
  const [panelSource, setPanelSource] = useState('filter');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Update flow
  const [updatingRoute, setUpdatingRoute] = useState(null);

  const discardActionRef = useRef(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [deleteConfirmRouteId, setDeleteConfirmRouteId] = useState(null);

  const openDiscardDialog = useCallback((onConfirm) => {
    discardActionRef.current = onConfirm;
    setDiscardDialogOpen(true);
  }, []);

  const confirmDiscard = useCallback(() => {
    setDiscardDialogOpen(false);
    const fn = discardActionRef.current;
    discardActionRef.current = null;
    fn?.();
  }, []);

  const cancelDiscard = useCallback(() => {
    setDiscardDialogOpen(false);
    discardActionRef.current = null;
  }, []);

  const [editDraft, setEditDraft] = useState({
    name: '',
    startLocation: '',
    endLocation: '',
    isPublic: true,
  });

  //Interaction - hazard
const [showCreateInteraction, setShowCreateInteraction] = useState(false);
const [pickedLocation, setPickedLocation] = useState(null);
const [pickingLocation, setPickingLocation] = useState(false);
const [interactionInitialType, setInteractionInitialType] = useState('hazard');
const [showHazards, setShowHazards] = useState(false);
const [hazards, setHazards] = useState([]);
const [feedbackRoute, setFeedbackRoute] = useState(null);

  // Load saved route IDs on mount
  useEffect(() => {
    favSvc.getFavourites()
      .then(res => setSavedRouteIds(new Set(res.data.routes.map(r => r._id))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshFilterCounts();
  }, [userId]); // eslint-disable-line

  useEffect(() => {
    fetchByFilter(activeFilter);
  }, [activeFilter]); // eslint-disable-line

  useEffect(() => {
    if (mode !== 'create' || waypoints.length < 2) {
      setLiveStats(null);
      return;
    }
    setLiveStats(calculateRouteStats(waypoints));
  }, [mode, waypoints]);

  useEffect(() => {
    if (mode === 'create' && waypoints.length >= 2) {
      setStackCollapsed(false);
    }
  }, [mode, waypoints.length]);

  useEffect(() => {
  if (showHazards) fetchHazards();
  else setHazards([]);
}, [showHazards]); // eslint-disable-line

  async function fetchByFilter(filter) {
    try {
      let res;
      if (filter === 'public') res = await routeSvc.getPublicRoutes();
      else if (filter === 'myRoutes') res = await routeSvc.getUserRoutes(userId);
      else if (filter === 'saved') res = await favSvc.getFavourites();
      if (res) setRoutes(res.data.routes);
    } catch (err) {
      console.error('Failed to fetch routes', err);
    }
  }

  async function refreshFilterCounts() {
    try {
      const [publicRes, myRoutesRes, savedRes] = await Promise.all([
        routeSvc.getPublicRoutes(),
        routeSvc.getUserRoutes(userId),
        favSvc.getFavourites(),
      ]);
      setFilterCounts({
        public: publicRes.data?.routes?.length || 0,
        myRoutes: myRoutesRes.data?.routes?.length || 0,
        saved: savedRes.data?.routes?.length || 0,
      });
    } catch (err) {
      console.error('Failed to refresh filter counts', err);
    }
  }

  const handleViewFeedback = useCallback((route) => {
  setFeedbackRoute(route);
}, []);

  function handleSearchArea() {
    setSearchLoading(true);
    setSearchError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await routeSvc.getNearbyRoutes(lat, lng, 5000);
          setNearbyRoutes(res.data.routes);
          setPanelSource('nearby');
          setMapCenter([lng, lat]);
          setSelectedRoute(null);
          setSidePanelView('list');
          setSidePanelOpen(true);
          setStackCollapsed(false);
        } catch {
          setSearchError('Failed to fetch nearby routes.');
        } finally {
          setSearchLoading(false);
        }
      },
      () => {
        setSearchError('Location access denied.');
        setSearchLoading(false);
      }
    );
  }

  function handleRouteClick(route) {
    setSelectedRoute(route);
    setSidePanelView('detail');
    setSidePanelOpen(true);
  }

  function focusRouteOnMap(route) {
    if (!route?.coordinates || route.coordinates.length < 2) return;
    const coordsCopy = [...route.coordinates];
    setFocusCoordinates(null);
    setTimeout(() => setFocusCoordinates(coordsCopy), 0);
  }

  function handleSelectFromList(route) {
    setSelectedRoute(route);
    setSidePanelView('detail');
    focusRouteOnMap(route);
  }

  function handleBackToList() {
    setSelectedRoute(null);
    setSidePanelView('list');
  }

  function handleClosePanel() {
    if (sidePanelView === 'list' && panelSource === 'filter' && activeFilter !== 'public') {
      handleFilterChange('public');
      return;
    }
    if (updatingRoute) {
      handleCancelUpdateInPanel();
    }
    setSidePanelOpen(false);
    setSelectedRoute(null);
  }

  function handleFilterChange(nextFilter) {
    setActiveFilter(nextFilter);
    setPanelSource('filter');
    setSelectedRoute(null);
    setSidePanelView('list');
    setSidePanelOpen(true);
  }

  function handleStartUpdate(route) {
    const editableWaypoints = route.waypoints?.length >= 2
      ? route.waypoints
      : route.coordinates;

    setUpdatingRoute(route);
    setWaypoints(editableWaypoints);
    setSelectedRoute(route);
    setSidePanelView('detail');
    setSidePanelOpen(true);
    setMode('create');
    focusRouteOnMap(route);
  }

  function switchToCreate() {
    setSelectedRoute(null);
    setSidePanelOpen(false);
    setMode('create');
  }

  function switchToDisplay() {
    setWaypoints([]);
    setLiveStats(null);
    setUpdatingRoute(null);
    setMode('display');
    setSidePanelOpen(true);
    setSidePanelView('list');
  }

  async function fetchHazards() {
  try {
    const data = await getActiveHazards(token);
    setHazards(data);
  } catch (err) {
    console.error('Failed to fetch hazards', err);
  }
}

  const handleToggleMode = useCallback(() => {
    if (mode === 'display') {
      switchToCreate();
    } else if (waypoints.length > 0) {
      openDiscardDialog(() => switchToDisplay());
    } else {
      switchToDisplay();
    }
  }, [mode, waypoints, openDiscardDialog]);

  const handleSaveFormCancel = useCallback(() => {
    if (updatingRoute) {
      openDiscardDialog(() => handleCancelUpdateInPanel());
      return;
    }
    if (waypoints.length > 0) {
      openDiscardDialog(() => switchToDisplay());
      return;
    }
    switchToDisplay();
  }, [updatingRoute, waypoints, openDiscardDialog]);

  const handleRequestDeleteRoute = useCallback((routeId) => {
    setDeleteConfirmRouteId(routeId);
  }, []);

  const handleWaypointAdd = useCallback((lngLat) => {
    setWaypoints(prev => [...prev, [lngLat.lng, lngLat.lat]]);
  }, []);

  const handleWaypointRemove = useCallback((index) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleWaypointMove = useCallback((index, newCoord) => {
    setWaypoints(prev => prev.map((wp, i) => (i === index ? newCoord : wp)));
  }, []);

  async function handleSaveRoute(name, isPublic) {
    const updatingId = updatingRoute?._id;
    const wasUpdating = !!updatingRoute;
    const coordsSnapshot = wasUpdating && waypoints.length >= 2 ? [...waypoints] : null;
    try {
      let res;
      if (wasUpdating) {
        res = await routeSvc.updateRoute(updatingId, { name, coordinates: waypoints, isPublic });
      } else {
        res = await routeSvc.createRoute({ name, coordinates: waypoints, isPublic });
      }
      const saved = res.data.route;
      switchToDisplay();
      setRoutes(prev =>
        wasUpdating
          ? prev.map(r => r._id === updatingId ? saved : r)
          : [saved, ...prev]
      );
      setNearbyRoutes(prev =>
        wasUpdating ? prev.map(r => r._id === updatingId ? saved : r) : prev
      );
      setSelectedRoute(saved);
      setSidePanelView('detail');
      setSidePanelOpen(true);
      refreshFilterCounts();
      if (wasUpdating && coordsSnapshot) {
        setFocusCoordinates(null);
        setTimeout(() => setFocusCoordinates(coordsSnapshot), 50);
      }
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error
        || (Array.isArray(data?.errors) ? data.errors[0] : null)
        || 'Failed to save route.';
      throw new Error(typeof msg === 'string' ? msg : 'Failed to save route.');
    }
  }

  function handleCancelUpdateInPanel() {
    setUpdatingRoute(null);
    setWaypoints([]);
    setLiveStats(null);
    setMode('display');
  }

  function handleAddFeedback(route) {
  setSelectedRoute(route);
  setInteractionInitialType('feedback');
  setShowCreateInteraction(true);
}

  async function handleToggleSave(routeId) {
    try {
      if (savedRouteIds.has(routeId)) {
        await favSvc.removeFavourite(routeId);
        setSavedRouteIds(prev => { const s = new Set(prev); s.delete(routeId); return s; });
      } else {
        await favSvc.addFavourite(routeId);
        setSavedRouteIds(prev => new Set(prev).add(routeId));
      }
      refreshFilterCounts();
    } catch (err) {
      console.error('Toggle save failed', err);
    }
  }

  async function handleDeleteRoute(routeId) {
    try {
      await routeSvc.deleteRoute(routeId);
      setRoutes(prev => prev.filter(r => r._id !== routeId));
      setNearbyRoutes(prev => prev.filter(r => r._id !== routeId));
      setSelectedRoute(null);
      setSidePanelView('list');
      refreshFilterCounts();
    } catch (err) {
      console.error('Delete route failed', err);
    }
  }

  async function handleCreateInteractionSubmit(formData) {
  try {
    await createInteraction(formData, token);
    setPickedLocation(null);
    setShowCreateInteraction(false);
  } catch (err) {
    console.error('Failed to create interaction', err);
  }
}

  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const listRoutes = panelSource === 'nearby' ? nearbyRoutes : routes;
  const listTitle = panelSource === 'nearby'
    ? 'Nearby Routes'
    : activeFilter === 'myRoutes'
      ? 'My Routes'
      : activeFilter === 'saved'
        ? 'Saved Routes'
        : 'All Routes';
  const listEmptyMessage = panelSource === 'nearby'
    ? 'No routes found nearby. Try searching from a different location.'
    : 'No routes found for this filter.';

  const saveOrUpdateFormOpen = mode === 'create';
  const sidePanelEmbeddedVisible = sidePanelOpen && !saveOrUpdateFormOpen;

  return (
    <div
      className='box-border h-screen max-h-screen overflow-hidden'
      style={{
        marginLeft: 'var(--map-sidebar-width, 260px)',
        width: 'calc(100vw - var(--map-sidebar-width, 260px))',
      }}
    >
      <div className='relative h-full min-h-0'>
        <MapContainer
          mode={mode}
          routes={routes}
          hazards={showHazards ? hazards : []}
          waypoints={waypoints}
          selectedRoute={selectedRoute}
          mapCenter={mapCenter}
          focusCoordinates={focusCoordinates}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onMapClick={(lngLat) => {
  if (mode === 'create') {
    handleWaypointAdd(lngLat);
  } else if (pickingLocation) {
    setPickedLocation({ lng: lngLat.lng, lat: lngLat.lat });
    setPickingLocation(false);
    setShowCreateInteraction(true);
  }
}}
          onRouteClick={mode === 'display' ? handleRouteClick : undefined}
          onWaypointRemove={handleWaypointRemove}
          onWaypointMove={handleWaypointMove}
        />

        <DraggableOverlay initialX={24} initialY={18} zIndex={20} handleSelector='.drag-handle'>
          <div
            className={`w-[24rem] flex flex-col bg-[#f8f9fc]/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
              ${stackCollapsed
                ? 'h-auto'
                : sidePanelEmbeddedVisible
                  ? 'h-[calc(100vh-2.5rem)]'
                  : 'h-auto max-h-[calc(100vh-2.5rem)]'}`}
          >
            <div className='drag-handle cursor-move select-none px-4 py-2 bg-white border-b border-gray-200 text-[11px] text-gray-500 font-semibold tracking-wide uppercase flex items-center justify-between'>
              <span>Route Explorer</span>
              <button
                type='button'
                onClick={() => setStackCollapsed(prev => !prev)}
                aria-label={stackCollapsed ? 'Expand panel' : 'Collapse panel'}
                title={stackCollapsed ? 'Expand panel' : 'Collapse panel'}
                className='inline-flex items-center justify-center w-7 h-7 rounded-md
                  text-brand-dark hover:text-brand-orange hover:bg-brand-orange/10 transition-colors'
              >
                <span className='text-base leading-none'>
                  {stackCollapsed ? '▾' : '▴'}
                </span>
              </button>
            </div>

            {!stackCollapsed && (
              <>
                {/* <div className='p-3 space-y-3 bg-[#f8f9fc] border-b border-gray-200'>
                  <div className='flex items-center gap-2'>
                    {mode === 'display' ? (
                      <>
                        <PrimaryBrandButton onClick={handleToggleMode} className='flex-1 px-4 py-2'>
                          + Create Route
                        </PrimaryBrandButton>
                        <PrimaryBrandButton
                          onClick={handleSearchArea}
                          disabled={searchLoading}
                          className='flex-1 px-4 py-2'
                        >
                          <span>{searchLoading ? 'Locating...' : 'Search in this Area'}</span>
                        </PrimaryBrandButton>
                      </>
                    ) : (
                      <div className='flex w-full justify-start pl-2'>
                        <button
                          type='button'
                          onClick={handleToggleMode}
                          className='text-sm font-medium text-blue-600 hover:text-brand-orange transition-colors'
                        >
                          ← Back to Map
                        </button>
                      </div>
                    )}
                  </div> */}
            <div className='p-3 space-y-3 bg-[#f8f9fc] border-b border-gray-200'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleToggleMode}
                  className='flex-1 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm
                    bg-brand-dark text-brand-cream
                    hover:bg-brand-sage hover:text-brand-dark transition-colors'
                >
                  {mode === 'display' ? '+ Create Route' : '← Back to Map'}
                </button>

                {mode === 'display' && (
  <>
    <button
      onClick={handleSearchArea}
      disabled={searchLoading}
      className='flex-1 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm
        bg-brand-dark text-brand-cream
        hover:bg-brand-sage hover:text-brand-dark transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed'
    >
      {searchLoading ? 'Locating...' : 'Search Area'}
    </button>
    <button
      onClick={() => {
  setInteractionInitialType('hazard');
  setShowCreateInteraction(true);
}}
      className='flex-1 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm
        bg-brand-orange text-white hover:opacity-90 transition-colors'
    >
      ⚠️ Report
    </button>
  </>
)}
                
              </div>

                  {searchError && (
                    <p className='text-brand-red text-xs bg-white rounded-lg px-2 py-1 border border-brand-red/20'>
                      {searchError}
                    </p>
                  )}

                  {mode === 'display' && (
                    <FilterPanel
                      activeFilter={activeFilter}
                      onChange={handleFilterChange}
                      variant='inline'
                      counts={filterCounts}
                    />
                  )}

              {mode === 'display' && (
  <button
    onClick={() => setShowHazards(prev => !prev)}
    className={`w-full px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-colors
      ${showHazards
        ? 'bg-brand-orange text-white'
        : 'bg-white border border-gray-200 text-brand-dark hover:bg-brand-orange/10'}`}
  >
    {showHazards ? '⚠️ Hazards ON' : '⚠️ Hazards OFF'}
  </button>
)}
                </div>

                {mode === 'create' && (
                  <div className='flex-shrink-0 border-b border-gray-200 bg-white px-3 pt-3 pb-2'>
                    <SaveRouteForm
                      key={updatingRoute?._id || 'new-route'}
                      waypoints={waypoints}
                      liveStats={liveStats}
                      onSave={handleSaveRoute}
                      onCancel={handleSaveFormCancel}
                      isUpdate={!!updatingRoute}
                      initialName={updatingRoute?.name || ''}
                      initialIsPublic={updatingRoute?.isPublic !== false}
                    />
                  </div>
                )}

                {sidePanelEmbeddedVisible && (
                  <div className='flex-1 min-h-0 bg-white'>
                    <SidePanel
                      view={sidePanelView}
                      routesList={listRoutes}
                      listTitle={listTitle}
                      emptyMessage={listEmptyMessage}
                      selectedRoute={selectedRoute}
                      isEditing={!!updatingRoute}
                      userId={userId}
                      savedRouteIds={savedRouteIds}
                      hasList={listRoutes.length > 0 || sidePanelView === 'list'}
                      onSelectRoute={handleSelectFromList}
                      onBackToList={handleBackToList}
                      onToggleSave={handleToggleSave}
                      onDelete={handleRequestDeleteRoute}
                      onUpdate={handleStartUpdate}
    onAddFeedback={handleAddFeedback}
onViewFeedback={handleViewFeedback}
embedded={true}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </DraggableOverlay>

        {mode === 'create' && waypoints.length < 2 && (
          <div className='absolute bottom-6 left-1/2 -translate-x-1/2 z-10
            bg-brand-dark/80 text-brand-cream text-sm px-4 py-2 rounded-full'>
            Click on the map to add waypoints (minimum 2 required)
          </div>
        )}

        {/* Hazard location picking hint */}
{pickingLocation && (
  <div className='absolute bottom-6 left-1/2 -translate-x-1/2 z-10
    bg-brand-orange/90 text-white text-sm px-4 py-2 rounded-full'>
    📍 Click on the map to place your hazard
  </div>
)}

{/* Create Interaction Modal */}
{showCreateInteraction && (
  <CreateInteraction
  onClose={() => {
    setShowCreateInteraction(false);
    setPickedLocation(null);
    setPickingLocation(false);
  }}
  onSubmit={handleCreateInteractionSubmit}
  onPickLocation={() => {
    setShowCreateInteraction(false);
    setPickingLocation(true);
  }}
  pickedLocation={pickedLocation}
  selectedRoute={selectedRoute}
  initialType={interactionInitialType}
/>
)}

{feedbackRoute && (
  <RouteFeedbackModal
    route={feedbackRoute}
    token={token}
    onClose={() => setFeedbackRoute(null)}
  />
)}
      </div>

      <ConfirmAlert
        open={discardDialogOpen}
        title='Discard changes?'
        description='You have unsaved changes. If you leave now, your edits will be lost.'
        primaryLabel='Discard'
        primaryTone='neutral'
        onPrimary={confirmDiscard}
        secondaryLabel='Keep editing'
        onSecondary={cancelDiscard}
        onClose={cancelDiscard}
      />

      <ConfirmAlert
        open={deleteConfirmRouteId != null}
        title='Delete route?'
        description='This action cannot be undone.'
        primaryLabel='Delete'
        primaryTone='danger'
        onPrimary={() => {
          const id = deleteConfirmRouteId;
          setDeleteConfirmRouteId(null);
          if (id) void handleDeleteRoute(id);
        }}
        secondaryLabel='Cancel'
        onSecondary={() => setDeleteConfirmRouteId(null)}
        onClose={() => setDeleteConfirmRouteId(null)}
      />
    </div>
  );
}
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as routeSvc from '../services/routeService';
import * as favSvc from '../services/favouriteService';
import MapContainer from '../components/map/MapContainer';
import FilterPanel from '../components/map/FilterPanel';
import SidePanel from '../components/map/SidePanel';
import CreateModeStats from '../components/map/CreateModeStats';
import SaveRouteForm from '../components/map/SaveRouteForm';
import CreateInteraction from '../components/interactions/CreateInteraction';
import { createInteraction, getActiveHazards, getRouteFeedback } from '../services/interactionService';
import RouteFeedbackModal from '../components/interactions/RouteFeedbackModal';

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
  const [routes, setRoutes] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [savedRouteIds, setSavedRouteIds] = useState(new Set());
  const [liveStats, setLiveStats] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [focusCoordinates, setFocusCoordinates] = useState(null);
  const [zoom, setZoom] = useState(10);

  // Side panel state
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelView, setSidePanelView] = useState('detail'); // 'list' | 'detail'
  const [nearbyRoutes, setNearbyRoutes] = useState([]);
  const [panelSource, setPanelSource] = useState('filter'); // 'filter' | 'nearby'
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Update flow
  const [updatingRoute, setUpdatingRoute] = useState(null);
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

  // Fetch routes whenever filter changes
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
    // Clear first so selecting the same route again still retriggers fitBounds.
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
    setUpdatingRoute(route);
    setWaypoints(route.coordinates);
    setEditDraft({
      name: route.name || '',
      startLocation: route.startLocation || '',
      endLocation: route.endLocation || '',
      isPublic: !!route.isPublic,
    });
    setSelectedRoute(route);
    setSidePanelView('detail');
    setSidePanelOpen(true);
    setMode('create');
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
    } else {
      if (waypoints.length > 0) {
        if (window.confirm('Discard current waypoints and return to Display Mode?')) {
          switchToDisplay();
        }
      } else {
        switchToDisplay();
      }
    }
  }, [mode, waypoints]);

  const handleWaypointAdd = useCallback((lngLat) => {
    setWaypoints(prev => [...prev, [lngLat.lng, lngLat.lat]]);
  }, []);

  const handleWaypointRemove = useCallback((index) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  }, []);

  async function handleSaveRoute(name, isPublic) {
    try {
      let res;
      if (updatingRoute) {
        res = await routeSvc.updateRoute(updatingRoute._id, { name, coordinates: waypoints, isPublic });
      } else {
        res = await routeSvc.createRoute({ name, coordinates: waypoints, isPublic });
      }
      const saved = res.data.route;
      switchToDisplay();
      setRoutes(prev =>
        updatingRoute
          ? prev.map(r => r._id === updatingRoute._id ? saved : r)
          : [saved, ...prev]
      );
      setSelectedRoute(saved);
      setSidePanelView('detail');
      setSidePanelOpen(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save route.';
      throw new Error(msg);
    }
  }

  async function handleSaveUpdatedRoute() {
    if (!updatingRoute) return;
    const trimmedName = editDraft.name.trim();
    if (!trimmedName || waypoints.length < 2) return;

    try {
      const res = await routeSvc.updateRoute(updatingRoute._id, {
        name: trimmedName,
        coordinates: waypoints,
        isPublic: editDraft.isPublic,
        startLocation: editDraft.startLocation.trim(),
        endLocation: editDraft.endLocation.trim(),
      });
      const apiRoute = res.data?.route || {};
      const recalculated = calculateRouteStats(waypoints);
      const mergedUpdatedRoute = {
        ...updatingRoute,
        ...apiRoute,
        _id: updatingRoute._id,
        name: trimmedName,
        coordinates: [...waypoints],
        isPublic: editDraft.isPublic,
        startLocation: editDraft.startLocation.trim(),
        endLocation: editDraft.endLocation.trim(),
        distance: Number.isFinite(apiRoute.distance) ? apiRoute.distance : recalculated.distance,
        estimatedTime: Number.isFinite(apiRoute.estimatedTime) ? apiRoute.estimatedTime : recalculated.estimatedTime,
      };

      // Snapshot coords before state is cleared
      const savedCoords = [...waypoints];

      setRoutes(prev => prev.map(r => r._id === updatingRoute._id ? mergedUpdatedRoute : r));
      setNearbyRoutes(prev => prev.map(r => r._id === updatingRoute._id ? mergedUpdatedRoute : r));

      // Transition to display mode showing updated route details.
      // setMode('display') must come before setUpdatingRoute(null) so the
      // SidePanel (gated only on sidePanelOpen) stays mounted throughout.
      setMode('display');
      setSelectedRoute(mergedUpdatedRoute);
      setSidePanelView('detail');
      setSidePanelOpen(true);
      setWaypoints([]);
      setLiveStats(null);
      setEditDraft({ name: '', startLocation: '', endLocation: '', isPublic: true });
      setUpdatingRoute(null);

      // Reset then re-set focusCoordinates to guarantee MapContainer's
      // fitBounds useEffect fires even when coords content is unchanged
      setFocusCoordinates(null);
      setTimeout(() => setFocusCoordinates(savedCoords), 50);

    } catch (err) {
      console.error('Update route failed', err);
    }
  }

  function handleCancelUpdateInPanel() {
    setUpdatingRoute(null);
    setWaypoints([]);
    setLiveStats(null);
    setMode('display');
    setEditDraft({ name: '', startLocation: '', endLocation: '', isPublic: true });
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

  return (
    <div className='h-screen w-screen overflow-hidden'>
      {/* TODO: Side navigation placeholder */}
      {/* <SideNavigation /> */}
      <div className='relative h-full'>
        <MapContainer
          mode={mode}
          routes={routes}
          hazards={showHazards ? hazards : []}
          waypoints={waypoints}
          selectedRoute={selectedRoute}
          mapCenter={mapCenter}
          focusCoordinates={focusCoordinates}
          activeFilter={activeFilter}
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
        />

        {/* Unified control stack — draggable as one unit */}
        <DraggableOverlay initialX={24} initialY={18} zIndex={20} handleSelector='.drag-handle'>
          <div className='w-[24rem] h-[calc(100vh-2.5rem)] flex flex-col bg-[#f8f9fc]/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='drag-handle cursor-move select-none px-4 py-2 bg-white border-b border-gray-200 text-[11px] text-gray-500 font-semibold tracking-wide uppercase'>
              Tracking Stack
            </div>

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

            {sidePanelOpen && (
              <div className='flex-1 min-h-0 bg-white'>
                <SidePanel
                  view={sidePanelView}
                  routesList={listRoutes}
                  listTitle={listTitle}
                  emptyMessage={listEmptyMessage}
                  selectedRoute={selectedRoute}
                  isEditing={!!updatingRoute}
                  editDraft={editDraft}
                  liveStats={liveStats}
                  userId={userId}
                  savedRouteIds={savedRouteIds}
                  hasList={listRoutes.length > 0 || sidePanelView === 'list'}
                  onSelectRoute={handleSelectFromList}
                  onBackToList={handleBackToList}
                  onToggleSave={handleToggleSave}
                  onDelete={handleDeleteRoute}
                  onUpdate={handleStartUpdate}
                  onEditDraftChange={setEditDraft}
                  onSaveEdit={handleSaveUpdatedRoute}
                  onCancelEdit={handleCancelUpdateInPanel}
                  onClose={handleClosePanel}
onAddFeedback={handleAddFeedback}
onViewFeedback={handleViewFeedback}
embedded={true}
                />
              </div>
            )}
          </div>
        </DraggableOverlay>

        {/* Create Mode overlays — only for new routes, not update flow */}
        {mode === 'create' && !updatingRoute && waypoints.length >= 2 && (
          <>
            <CreateModeStats stats={liveStats} />
            <SaveRouteForm
              waypoints={waypoints}
              onSave={handleSaveRoute}
              onCancel={switchToDisplay}
              isUpdate={!!updatingRoute}
            />
          </>
        )}

        {/* Waypoint helper hint */}
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
    </div>
  );
}
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as routeSvc from '../services/routeService';
import * as favSvc from '../services/favouriteService';
import Navbar from '../components/shared/Navbar';
import MapContainer from '../components/map/MapContainer';
import FilterPanel from '../components/map/FilterPanel';
import SidePanel from '../components/map/SidePanel';
import CreateModeStats from '../components/map/CreateModeStats';
import SaveRouteForm from '../components/map/SaveRouteForm';

export default function MapPage() {
  const { userId } = useAuth();
  const [mode, setMode] = useState('display');
  const [activeFilter, setActiveFilter] = useState('public');
  const [routes, setRoutes] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [savedRouteIds, setSavedRouteIds] = useState(new Set());
  const [liveStats, setLiveStats] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [zoom, setZoom] = useState(10);

  // Side panel state
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelView, setSidePanelView] = useState('detail'); // 'list' | 'detail'
  const [nearbyRoutes, setNearbyRoutes] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Update flow
  const [updatingRoute, setUpdatingRoute] = useState(null);

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

  // "Search in this Area" — auto-geolocate, fetch nearby, open side panel in list view
  function handleSearchArea() {
    setSearchLoading(true);
    setSearchError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await routeSvc.getNearbyRoutes(lat, lng, 5000);
          setNearbyRoutes(res.data.routes);
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

  // Clicking a route on the map opens the side panel in detail view
  function handleRouteClick(route) {
    setSelectedRoute(route);
    setSidePanelView('detail');
    setSidePanelOpen(true);
  }

  // Selecting a route from the nearby list
  function handleSelectFromList(route) {
    setSelectedRoute(route);
    setSidePanelView('detail');
  }

  // Back button in detail view returns to list
  function handleBackToList() {
    setSelectedRoute(null);
    setSidePanelView('list');
  }

  // Close the side panel entirely
  function handleClosePanel() {
    setSidePanelOpen(false);
    setSelectedRoute(null);
  }

  // Update: pre-load existing coordinates into create mode
  function handleStartUpdate(route) {
    setUpdatingRoute(route);
    setWaypoints(route.coordinates);
    setSidePanelOpen(false);
    setSelectedRoute(null);
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
      // Return to list view; if list is now empty the empty state message will show
      setSidePanelView('list');
    } catch (err) {
      console.error('Delete route failed', err);
    }
  }

  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  return (
    <div className='h-screen w-screen flex flex-col overflow-hidden'>
      <Navbar />
      <div className='relative flex-1 mt-14'>
        <MapContainer
          mode={mode}
          routes={routes}
          waypoints={waypoints}
          selectedRoute={selectedRoute}
          mapCenter={mapCenter}
          activeFilter={activeFilter}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onMapClick={mode === 'create' ? handleWaypointAdd : undefined}
          onRouteClick={mode === 'display' ? handleRouteClick : undefined}
          onWaypointRemove={handleWaypointRemove}
        />

        {/* Mode toggle button — top centre */}
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10'>
          <button
            onClick={handleToggleMode}
            className='px-5 py-2 rounded-full font-semibold shadow-lg
              bg-brand-dark text-brand-cream
              hover:bg-brand-sage hover:text-brand-dark transition-colors'
          >
            {mode === 'display' ? '+ Create Route' : '← Back to Map'}
          </button>
        </div>

        {/* Display Mode overlays */}
        {mode === 'display' && (
          <>
            {/* Search in this Area button — top right */}
            <div className='absolute top-4 right-4 z-10'>
              <button
                onClick={handleSearchArea}
                disabled={searchLoading}
                className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  shadow-lg bg-brand-dark text-brand-cream
                  hover:bg-brand-sage hover:text-brand-dark transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <span>📍</span>
                <span>{searchLoading ? 'Locating...' : 'Search in this Area'}</span>
              </button>
              {searchError && (
                <p className='mt-1 text-brand-red text-xs bg-white/90 rounded-lg
                  px-2 py-1 shadow text-right'>
                  {searchError}
                </p>
              )}
            </div>

            {/* Filter panel — sits below the search button */}
            <FilterPanel
              activeFilter={activeFilter}
              onChange={setActiveFilter}
            />

            {/* Side panel — nearby list and/or route detail */}
            {sidePanelOpen && (
              <SidePanel
                view={sidePanelView}
                nearbyRoutes={nearbyRoutes}
                selectedRoute={selectedRoute}
                userId={userId}
                savedRouteIds={savedRouteIds}
                hasNearbyList={nearbyRoutes.length > 0 || sidePanelView === 'list'}
                onSelectRoute={handleSelectFromList}
                onBackToList={handleBackToList}
                onToggleSave={handleToggleSave}
                onDelete={handleDeleteRoute}
                onUpdate={handleStartUpdate}
                onClose={handleClosePanel}
              />
            )}
          </>
        )}

        {/* Create Mode overlays */}
        {mode === 'create' && waypoints.length >= 2 && (
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
      </div>
    </div>
  );
}
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as routeSvc from '../services/routeService';
import * as favSvc from '../services/favouriteService';
import Navbar from '../components/shared/Navbar';
import MapContainer from '../components/map/MapContainer';
import FilterPanel from '../components/map/FilterPanel';
import NearbySearch from '../components/map/NearbySearch';
import RouteDetailsPanel from '../components/map/RouteDetailsPanel';
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

  // Load saved route IDs on mount so save/unsave button renders correctly
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
      // 'nearby' is triggered separately via NearbySearch
      if (res) setRoutes(res.data.routes);
    } catch (err) {
      console.error('Failed to fetch routes', err);
    }
  }

  async function handleNearbySearch(lat, lng, radius) {
    try {
      const res = await routeSvc.getNearbyRoutes(lat, lng, radius);
      setRoutes(res.data.routes);
      setMapCenter([lng, lat]);
    } catch (err) {
      console.error('Nearby search failed', err);
    }
  }

  function switchToCreate() {
    setSelectedRoute(null);
    setMode('create');
  }

  function switchToDisplay() {
    setWaypoints([]);
    setLiveStats(null);
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
      const res = await routeSvc.createRoute({ name, coordinates: waypoints, isPublic });
      const newRoute = res.data.route;
      switchToDisplay();
      setRoutes(prev => [newRoute, ...prev]);
      setSelectedRoute(newRoute);
    } catch (err) {
      // Return error message to SaveRouteForm to display inline
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
      setSelectedRoute(null);
    } catch (err) {
      console.error('Delete route failed', err);
    }
  }

  return (
    <div className='h-screen w-screen flex flex-col overflow-hidden'>
      <Navbar />
      {/* Map fills remaining height below navbar */}
      <div className='relative flex-1 mt-14'>
        <MapContainer
          mode={mode}
          routes={routes}
          waypoints={waypoints}
          selectedRoute={selectedRoute}
          mapCenter={mapCenter}
          activeFilter={activeFilter}
          onMapClick={mode === 'create' ? handleWaypointAdd : undefined}
          onRouteClick={mode === 'display' ? setSelectedRoute : undefined}
          onWaypointRemove={handleWaypointRemove}
        />
        {/* Mode toggle button */}
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
            <FilterPanel
              activeFilter={activeFilter}
              onChange={setActiveFilter}
            />
            <NearbySearch onSearch={handleNearbySearch} />
            {selectedRoute && (
              <RouteDetailsPanel
                route={selectedRoute}
                userId={userId}
                isSaved={savedRouteIds.has(selectedRoute._id)}
                onToggleSave={handleToggleSave}
                onDelete={handleDeleteRoute}
                onClose={() => setSelectedRoute(null)}
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
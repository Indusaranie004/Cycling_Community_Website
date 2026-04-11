import React, { useRef, useEffect, useState, useCallback } from 'react';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RouteLayer from './RouteLayer';
import WaypointLayer from './WaypointLayer';
import { Marker } from 'react-map-gl';


const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const FILTER_COLOURS = {
  public: '#0158CA',
  myRoutes: '#3235FF',
  nearby: '#E42926',
  saved: '#008A10',
  preview: '#262626',
};

const ZOOM_THRESHOLD = 11;

export default function MapContainer({
  mode, routes, waypoints, selectedRoute,
  mapCenter, focusCoordinates, activeFilter, zoom, onZoomChange,
  onMapClick, onRouteClick, onWaypointRemove, hazards = [],
}) {
  const mapRef = useRef();
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hoveredHazard, setHoveredHazard] = useState(null);
const [hazardTooltipPos, setHazardTooltipPos] = useState({ x: 0, y: 0 });

  // Fly to mapCenter when it changes (e.g. after nearby search)
  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.flyTo({ center: mapCenter, zoom: 13, duration: 1400 });
    }
  }, [mapCenter]);

  // Fit map to a route (used after successful update save)
  useEffect(() => {
    if (!focusCoordinates || focusCoordinates.length < 2 || !mapRef.current) return;

    const lats = focusCoordinates.map(([, lat]) => lat);
    const lngs = focusCoordinates.map(([lng]) => lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    mapRef.current.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding: 80, duration: 1200, maxZoom: 14 }
    );
  }, [focusCoordinates]);

  // Only register line layers as interactive when zoomed in enough to see them
  const interactiveLayerIds = zoom >= ZOOM_THRESHOLD
    ? routes
        .filter(r => r.coordinates && r.coordinates.length >= 2)
        .map(r => `line-${r._id}`)
    : [];

  const handleClick = (e) => {
    if (onMapClick) onMapClick(e.lngLat);
  };

  const handleMove = (e) => {
    if (onZoomChange) onZoomChange(e.viewState.zoom);
  };

  // Detect which route line the cursor is over and show a tooltip
  const handleMouseMove = useCallback((e) => {
    if (e.features && e.features.length > 0) {
      const layerId = e.features[0].layer.id;
      if (layerId.startsWith('line-')) {
        const routeId = layerId.replace('line-', '');
        const route = routes.find(r => r._id === routeId);
        if (route) {
          setHoveredRoute(route);
          setTooltipPos({ x: e.point.x, y: e.point.y });
          return;
        }
      }
    }
    setHoveredRoute(null);
  }, [routes]);

  const handleMouseLeave = useCallback(() => {
    setHoveredRoute(null);
  }, []);

  const cursor = hoveredRoute
    ? 'pointer'
    : mode === 'create'
    ? 'crosshair'
    : 'default';

  return (
    <div className='relative w-full h-full'>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 80.63, latitude: 7.29, zoom: 11 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle='mapbox://styles/mapbox/outdoors-v12'
        mapboxAccessToken={TOKEN}
        onClick={handleClick}
        onMove={handleMove}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={interactiveLayerIds}
        cursor={cursor}
        dragPan={true}
        touchPan={true}
        touchZoomRotate={true}
        cooperativeGestures={false}
      >
        <RouteLayer
          routes={routes}
          lineColor={FILTER_COLOURS[activeFilter]}
          selectedRouteId={selectedRoute?._id}
          onRouteClick={onRouteClick}
          zoom={zoom}
        />
        {mode === 'create' && (
          <WaypointLayer
            waypoints={waypoints}
            lineColor={FILTER_COLOURS.preview}
            onRemove={onWaypointRemove}
          />
        )}

        {hazards.map(hazard => {
  if (!hazard.intLatitude || !hazard.intLongitude) return null;
  const colour = hazard.severityLevel === 'high'
    ? '#E42926'
    : hazard.severityLevel === 'medium'
    ? '#FF7F11'
    : '#F5C518';

  return (
    <Marker
      key={hazard._id}
      longitude={hazard.intLongitude}
      latitude={hazard.intLatitude}
    >
      <div
        className='flex items-center justify-center w-8 h-8 rounded-full
          shadow-lg cursor-pointer border-2 border-white text-base
          transition-transform hover:scale-110'
        style={{ backgroundColor: colour }}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mapRect = e.currentTarget.closest('.relative').getBoundingClientRect();
          setHoveredHazard(hazard);
          setHazardTooltipPos({
            x: rect.left - mapRect.left + rect.width / 2,
            y: rect.top - mapRect.top,
          });
        }}
        onMouseLeave={() => setHoveredHazard(null)}
      >
        ⚠️
      </div>
    </Marker>
  );
})}
      </Map>

      {/* Hover tooltip — rendered outside the Map so it sits on top cleanly */}
      {hoveredRoute && (
        <div
          className='absolute z-30 pointer-events-none
            bg-brand-dark/95 text-brand-cream rounded-xl
            px-3 py-2 shadow-xl text-xs max-w-xs'
          style={{
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 48,
          }}
        >
          <p className='font-semibold truncate'>{hoveredRoute.name}</p>
          <p className='text-gray-300 truncate mt-0.5'>
            {hoveredRoute.startLocation || 'Start'}
            {' → '}
            {hoveredRoute.endLocation || 'End'}
          </p>
        </div>
      )}

      {hoveredHazard && (
  <div
    className='absolute z-30 pointer-events-none
      bg-brand-dark/95 text-brand-cream rounded-xl
      px-3 py-2 shadow-xl text-xs max-w-xs'
    style={{
      left: hazardTooltipPos.x + 14,
      top: hazardTooltipPos.y - 80,
    }}
  >
    <p className='font-semibold capitalize'>
      {hoveredHazard.severityLevel} Severity
    </p>
    <p className='text-gray-300 mt-0.5'>{hoveredHazard.intDescription}</p>
    <p className='text-gray-500 mt-1 text-[10px]'>
      Reported by {hoveredHazard.userId?.name || 'Unknown'}
    </p>
  </div>
)}
    </div>
  );
}
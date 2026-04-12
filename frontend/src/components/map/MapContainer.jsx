import React, { useRef, useEffect, useState, useCallback } from 'react';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/map/mapbox-cooperative-overrides.css';
import RouteLayer from './RouteLayer';
import WaypointLayer from './WaypointLayer';
import { Marker } from 'react-map-gl';

import { ROUTE_LINE_COLOR, ROUTE_LINE_VISIBILITY_MIN_ZOOM, ROUTE_FIT_BOUNDS } from '../../constants/routeMapView';

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapContainer({
  mode, routes, waypoints, selectedRoute,
  mapCenter, focusCoordinates, zoom, onZoomChange,
  onMapClick, onRouteClick, onWaypointRemove, hazards = [], onWaypointMove,
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
      {
        padding: ROUTE_FIT_BOUNDS.padding,
        duration: ROUTE_FIT_BOUNDS.duration,
        maxZoom: ROUTE_FIT_BOUNDS.maxZoom,
      }
    );
  }, [focusCoordinates]);

  // Only register line layers as interactive when zoomed in enough to see them
  const interactiveLayerIds = zoom >= ROUTE_LINE_VISIBILITY_MIN_ZOOM
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

  // With cooperativeGestures, wheel/trackpad scroll does not zoom unless Ctrl/Cmd is held.
  // Map two-finger trackpad scroll (wheel) to pan so pan vs zoom matches native map apps.
  const handleWheel = useCallback((e) => {
    const dom = e.originalEvent;
    if (!dom) return;
    if (dom.ctrlKey || dom.metaKey) return;
    if (dom.deltaX === 0 && dom.deltaY === 0) return;
    const map = mapRef.current?.getMap?.();
    if (!map) return;
    dom.preventDefault();
    map.panBy([-dom.deltaX, -dom.deltaY], { animate: false });
  }, []);

  const handleMapLoad = useCallback((evt) => {
    const map = evt.target;
    map.touchZoomRotate.disableRotation();
    // Apply brand color palette: #262626 dark, #ACBFA4 sage, #E2E8CE cream, #FF7F11 orange, #FF1B1C red
    const layers = map.getStyle().layers;
    layers.forEach((layer) => {
      const id = layer.id;
      const type = layer.type;
      try {
        if (type === 'background') {
          map.setPaintProperty(id, 'background-color', '#E2E8CE');
        } else if (type === 'fill') {
          if (id.includes('water')) {
            map.setPaintProperty(id, 'fill-color', '#ACBFA4');
          } else if (
            id.includes('park') || id.includes('green') ||
            id.includes('grass') || id.includes('wood') ||
            id.includes('nature') || id.includes('landuse')
          ) {
            map.setPaintProperty(id, 'fill-color', '#c8d4b0');
          } else if (id.includes('land')) {
            map.setPaintProperty(id, 'fill-color', '#E2E8CE');
          }
        } else if (type === 'line') {
          if (id.includes('motorway') || id.includes('trunk')) {
            map.setPaintProperty(id, 'line-color', '#FF7F11');
          } else if (id.includes('primary')) {
            map.setPaintProperty(id, 'line-color', '#d4a870');
          } else if (id.includes('boundary') || id.includes('admin')) {
            map.setPaintProperty(id, 'line-color', '#262626');
          }
        } else if (type === 'symbol') {
          if (id.includes('label') || id.includes('place')) {
            try { map.setPaintProperty(id, 'text-color', '#262626'); } catch (_) {}
          }
        }
      } catch (_) {}
    });

    try { map.setPaintProperty('settlement-label', 'text-color', '#000000'); } catch (_) {}
    try { map.setPaintProperty('place-label', 'text-color', '#000000'); } catch (_) {}
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
        mapStyle='mapbox://styles/mapbox/light-v11'
        mapboxAccessToken={TOKEN}
        onLoad={handleMapLoad}
        onClick={handleClick}
        onMove={handleMove}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        interactiveLayerIds={interactiveLayerIds}
        cursor={cursor}
        dragPan={true}
        dragRotate={false}
        touchZoomRotate={true}
        cooperativeGestures
      >
        <RouteLayer
          routes={routes}
          lineColor={ROUTE_LINE_COLOR}
          selectedRouteId={selectedRoute?._id}
          onRouteClick={onRouteClick}
          zoom={zoom}
        />
        {mode === 'create' && (
          <WaypointLayer
            waypoints={waypoints}
            lineColor={ROUTE_LINE_COLOR}
            onRemove={onWaypointRemove}
            onMove={onWaypointMove}
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
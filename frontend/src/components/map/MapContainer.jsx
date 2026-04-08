import React, { useRef, useEffect } from 'react';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RouteLayer from './RouteLayer';
import WaypointLayer from './WaypointLayer';

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Colour per filter
const FILTER_COLOURS = {
  public: '#ACBFA4',
  myRoutes: '#4A90D9',
  nearby: '#FF7F11',
  saved: '#FF1B1C',
  preview: '#262626',
};

export default function MapContainer({
  mode, routes, waypoints, selectedRoute,
  mapCenter, activeFilter,
  onMapClick, onRouteClick, onWaypointRemove,
}) {
  const mapRef = useRef();

  // Fly to mapCenter when it changes (e.g. after nearby search)
  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.flyTo({ center: mapCenter, zoom: 13, duration: 1400 });
    }
  }, [mapCenter]);

  const handleClick = (e) => {
    if (onMapClick) onMapClick(e.lngLat);
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: 80.63, latitude: 7.29, zoom: 11 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle='mapbox://styles/mapbox/outdoors-v12'
      mapboxAccessToken={TOKEN}
      onClick={handleClick}
      cursor={mode === 'create' ? 'crosshair' : 'default'}
    >
      {/* Existing routes layer */}
      <RouteLayer
        routes={routes}
        lineColor={FILTER_COLOURS[activeFilter]}
        selectedRouteId={selectedRoute?._id}
        onRouteClick={onRouteClick}
      />
      {/* Waypoints and preview line in Create Mode */}
      {mode === 'create' && (
        <WaypointLayer
          waypoints={waypoints}
          lineColor={FILTER_COLOURS.preview}
          onRemove={onWaypointRemove}
        />
      )}
    </Map>
  );
}
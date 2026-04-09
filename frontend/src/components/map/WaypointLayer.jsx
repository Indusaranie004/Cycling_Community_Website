import React from 'react';
import { Source, Layer, Marker } from 'react-map-gl';

export default function WaypointLayer({ waypoints, lineColor, onRemove }) {
  const geojson = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: waypoints },
  };

  return (
    <>
      {/* Preview line — only rendered when 2+ waypoints exist */}
      {waypoints.length >= 2 && (
        <Source id='preview-src' type='geojson' data={geojson}>
          <Layer
            id='preview-line'
            type='line'
            paint={{ 'line-color': lineColor, 'line-width': 3, 'line-dasharray': [2, 2] }}
          />
        </Source>
      )}
      {/* Numbered waypoint markers */}
      {waypoints.map((point, i) => (
        <Marker key={i} longitude={point[0]} latitude={point[1]}>
          <div
            className='w-7 h-7 rounded-full flex items-center justify-center
              text-xs font-bold cursor-pointer shadow
              bg-brand-dark text-brand-cream
              hover:bg-brand-red transition-colors'
            title='Click to remove waypoint'
            onClick={() => onRemove(i)}
          >
            {i + 1}
          </div>
        </Marker>
      ))}
    </>
  );
}
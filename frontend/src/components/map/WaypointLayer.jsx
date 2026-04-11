import React from 'react';
import { Source, Layer, Marker } from 'react-map-gl';
import MapPinSvg from './MapPinSvg';
import { ROUTE_DEST_COLOR, ROUTE_ORIGIN_COLOR } from '../../constants/routeMapView';

/** Via-waypoint pins: darker green between origin and destination. */
const VIA_PIN_FILL = '#15803d';

function pinFill(index, total) {
  if (index === 0) return ROUTE_ORIGIN_COLOR;
  if (total >= 2 && index === total - 1) return ROUTE_DEST_COLOR;
  return VIA_PIN_FILL;
}

export default function WaypointLayer({ waypoints, lineColor, onRemove, onMove }) {
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
      {waypoints.map((point, i) => {
        const n = waypoints.length;
        const fill = pinFill(i, n);
        return (
          <Marker
            key={i}
            longitude={point[0]}
            latitude={point[1]}
            anchor='bottom'
            draggable
            onDragEnd={(e) => onMove?.(i, [e.lngLat.lng, e.lngLat.lat])}
          >
            <div
              className='relative cursor-grab active:cursor-grabbing'
              title='Drag to move, click to remove'
              onClick={(ev) => {
                ev.stopPropagation();
                onRemove(i);
              }}
            >
              <MapPinSvg fill={fill} width={32} className='drop-shadow-md' />
              <span
                className='pointer-events-none absolute left-1/2 top-[7px] -translate-x-1/2
                  text-[11px] font-bold leading-none'
                style={{ color: fill }}
              >
                {i + 1}
              </span>
            </div>
          </Marker>
        );
      })}
    </>
  );
}
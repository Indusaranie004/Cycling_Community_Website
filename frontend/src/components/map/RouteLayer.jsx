import React from 'react';
import { Source, Layer, Marker } from 'react-map-gl';
import MapPinSvg from './MapPinSvg';
import { ROUTE_LINE_VISIBILITY_MIN_ZOOM, ROUTE_ORIGIN_COLOR, ROUTE_DEST_COLOR } from '../../constants/routeMapView';

const SELECTED_ROUTE_COLOUR = '#FF1B1C';

export default function RouteLayer({ routes, lineColor, selectedRouteId, onRouteClick, zoom }) {
  const showLines = zoom >= ROUTE_LINE_VISIBILITY_MIN_ZOOM;
  const orderedRoutes = [
    ...routes.filter(route => route._id !== selectedRouteId),
    ...routes.filter(route => route._id === selectedRouteId),
  ];

  return (
    <>
      {orderedRoutes.map(route => {
        if (!route.coordinates || route.coordinates.length < 2) return null;

        const isSelected = route._id === selectedRouteId;
        const geojson = {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: route.coordinates },
        };

        return (
          <React.Fragment key={route._id}>
            {showLines && (
              <Source id={`src-${route._id}`} type='geojson' data={geojson}>
                {/* White casing layer beneath for the shiny raised Komoot-style effect */}
                <Layer
                  id={`casing-${route._id}`}
                  type='line'
                  paint={{
                    'line-color': '#ffffff',
                    'line-width': isSelected ? 10 : 6,
                    'line-opacity': 0.9,
                  }}
                  layout={{
                    'line-cap': 'round',
                    'line-join': 'round',
                  }}
                />
                {/* Colour layer on top */}
                <Layer
                  id={`line-${route._id}`}
                  type='line'
                  paint={{
                    'line-color': isSelected ? SELECTED_ROUTE_COLOUR : lineColor,
                    'line-width': isSelected ? 6 : 3,
                    'line-opacity': isSelected ? 1 : 0.85,
                  }}
                  layout={{
                    'line-cap': 'round',
                    'line-join': 'round',
                  }}
                />
              </Source>
            )}
            {/* Pin icons (tip at lat/lng) — not Mapbox default teardrops. */}
            <Marker
              key={`${route._id}-start`}
              longitude={route.coordinates[0][0]}
              latitude={route.coordinates[0][1]}
              anchor='bottom'
              onClick={(e) => {
                e.originalEvent?.stopPropagation?.();
                onRouteClick?.(route);
              }}
            >
              <div
                className={`cursor-pointer transition-transform ${isSelected ? 'scale-110' : ''}`}
                title='Start'
              >
                <MapPinSvg fill={ROUTE_ORIGIN_COLOR} width={isSelected ? 30 : 24} />
              </div>
            </Marker>
            <Marker
              key={`${route._id}-end`}
              longitude={route.coordinates[route.coordinates.length - 1][0]}
              latitude={route.coordinates[route.coordinates.length - 1][1]}
              anchor='bottom'
              onClick={(e) => {
                e.originalEvent?.stopPropagation?.();
                onRouteClick?.(route);
              }}
            >
              <div
                className={`cursor-pointer transition-transform ${isSelected ? 'scale-110' : ''}`}
                title='End'
              >
                <MapPinSvg fill={ROUTE_DEST_COLOR} width={isSelected ? 30 : 24} />
              </div>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
}
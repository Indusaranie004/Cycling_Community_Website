import React from 'react';
import { Source, Layer, Marker } from 'react-map-gl';

const ZOOM_THRESHOLD = 11;

export default function RouteLayer({ routes, lineColor, selectedRouteId, onRouteClick, zoom }) {
  const showLines = zoom >= ZOOM_THRESHOLD;

  return (
    <>
      {routes.map(route => {
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
                    'line-color': lineColor,
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
            {/* Start marker — always visible regardless of zoom */}
            <Marker
              longitude={route.coordinates[0][0]}
              latitude={route.coordinates[0][1]}
              color='#ACBFA4'
              scale={isSelected ? 1.2 : 0.7}
              onClick={() => onRouteClick && onRouteClick(route)}
            />
            {/* End marker — always visible regardless of zoom */}
            <Marker
              longitude={route.coordinates[route.coordinates.length - 1][0]}
              latitude={route.coordinates[route.coordinates.length - 1][1]}
              color='#FF7F11'
              scale={isSelected ? 1.2 : 0.7}
              onClick={() => onRouteClick && onRouteClick(route)}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
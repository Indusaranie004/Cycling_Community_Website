import React from 'react';
import { Source, Layer, Marker } from 'react-map-gl';

export default function RouteLayer({ routes, lineColor, selectedRouteId, onRouteClick }) {
  return (
    <>
      {routes.map(route => {
        const isSelected = route._id === selectedRouteId;
        const geojson = {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: route.coordinates },
        };
        return (
          <React.Fragment key={route._id}>
            <Source id={`src-${route._id}`} type='geojson' data={geojson}>
              <Layer
                id={`line-${route._id}`}
                type='line'
                paint={{
                  'line-color': lineColor,
                  'line-width': isSelected ? 6 : 3,
                  'line-opacity': isSelected ? 1 : 0.75,
                }}
                onClick={() => onRouteClick && onRouteClick(route)}
              />
            </Source>
            {/* Start marker */}
            <Marker
              longitude={route.coordinates[0][0]}
              latitude={route.coordinates[0][1]}
              color='#ACBFA4'
              onClick={() => onRouteClick && onRouteClick(route)}
            />
            {/* End marker */}
            <Marker
              longitude={route.coordinates[route.coordinates.length - 1][0]}
              latitude={route.coordinates[route.coordinates.length - 1][1]}
              color='#FF7F11'
              onClick={() => onRouteClick && onRouteClick(route)}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
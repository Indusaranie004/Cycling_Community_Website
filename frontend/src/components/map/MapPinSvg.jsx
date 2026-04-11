import React from 'react';
import { ReactComponent as MapPinIcon } from '../../assets/icons/map-pin.svg';

/**
 * Map pin — vector lives in `assets/icons/map-pin.svg`; body uses `currentColor` (via style.color).
 * Use with react-map-gl <Marker anchor="bottom" /> so the tip sits on the coordinate.
 */
export default function MapPinSvg({
  fill,
  className = '',
  width = 28,
  height,
}) {
  const h = height ?? Math.round((width * 30) / 24);
  return (
    <MapPinIcon
      width={width}
      height={h}
      className={`pointer-events-none select-none ${className}`}
      style={{ color: fill }}
    />
  );
}

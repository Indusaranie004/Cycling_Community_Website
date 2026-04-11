/**
 * Central place to tune how routes appear on the map and when they become interactive.
 *
 * ROUTE_LINE_COLOR — Single blue for all saved-route polylines and create-mode preview lines.
 *
 * ROUTE_LINE_VISIBILITY_MIN_ZOOM — Saved route polylines (RouteLayer) only render and
 *   accept hover/click when the map is zoomed in at least this far. Also used in
 *   MapContainer for which line layers are queryable (tooltips).
 *
 * ROUTE_FIT_BOUNDS — Used when fitting the camera to a route (list selection, Update Route,
 *   after save). Increase maxZoom to zoom in closer on short routes; adjust padding for
 *   margin around the line.
 */
export const ROUTE_LINE_COLOR = '#0158CA';

export const ROUTE_LINE_VISIBILITY_MIN_ZOOM = 9;

export const ROUTE_FIT_BOUNDS = {
  padding: 80,
  maxZoom: 14,
  duration: 1200,
};

/** Origin pin / dot — dark green (aligned with Tailwind green-800). */
export const ROUTE_ORIGIN_COLOR = '#166534';

/** Destination pin / dot — brand dark. */
export const ROUTE_DEST_COLOR = '#262626';

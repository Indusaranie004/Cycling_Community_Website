import React, { useEffect, useState } from 'react';
import RoutePathCard from './RoutePathCard';
import RouteMetricsPill from './RouteMetricsPill';
import SegmentedVisibilityToggle from './SegmentedVisibilityToggle';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

async function reverseGeocode(lng, lat, signal) {
  if (!MAPBOX_TOKEN || lng == null || lat == null) return '';
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(lng)},${encodeURIComponent(lat)}.json?access_token=${encodeURIComponent(MAPBOX_TOKEN)}&limit=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) return '';
  const data = await res.json();
  return (data.features?.[0]?.place_name || '').trim();
}

/** Create/update save flow in Route Explorer: same layout for new routes and updates. */
export default function SaveRouteForm({
  waypoints,
  liveStats,
  onSave,
  onCancel,
  isUpdate = false,
  initialName = '',
  initialIsPublic = true,
  labelClassName = '',
}) {
  const [name, setName] = useState(initialName);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [nameError, setNameError] = useState('');
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [startLocationName, setStartLocationName] = useState('');
  const [endLocationName, setEndLocationName] = useState('');

  useEffect(() => {
    if (waypoints.length < 2) {
      setStartLocationName('');
      setEndLocationName('');
      return;
    }

    const start = waypoints[0];
    const end = waypoints[waypoints.length - 1];
    if (!start || !end || start.length < 2 || end.length < 2) return;

    const ac = new AbortController();
    const t = setTimeout(async () => {
      setStartLocationName('');
      setEndLocationName('');
      try {
        const [startLng, startLat] = [Number(start[0]), Number(start[1])];
        const [endLng, endLat] = [Number(end[0]), Number(end[1])];
        if (Number.isNaN(startLng) || Number.isNaN(startLat) || Number.isNaN(endLng) || Number.isNaN(endLat)) {
          return;
        }
        const [sName, eName] = await Promise.all([
          reverseGeocode(startLng, startLat, ac.signal),
          reverseGeocode(endLng, endLat, ac.signal),
        ]);
        if (!ac.signal.aborted) {
          setStartLocationName(sName);
          setEndLocationName(eName);
        }
      } catch (e) {
        if (e.name !== 'AbortError' && !ac.signal.aborted) {
          setStartLocationName('');
          setEndLocationName('');
        }
      }
    }, 400);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [waypoints]);

  const validateName = (val) => {
    if (!val.trim()) {
      setNameError('Route name is required.');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = async () => {
    setApiError('');
    if (!validateName(name)) return;
    if (waypoints.length < 2) return;
    setSaving(true);
    try {
      await onSave(name.trim(), isPublic);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = saving || !!nameError || !name.trim() || waypoints.length < 2;

  const startLabel = startLocationName || 'Start point';
  const endLabel = endLocationName || 'End point';

  const nameInputId = isUpdate ? 'edit-route-name' : 'new-route-name';
  const visibilityIdPrefix = isUpdate ? 'edit-route' : 'save-route';

  return (
    <div className='flex flex-col gap-4 pb-0'>
      <h3 className='text-brand-dark font-semibold text-sm'>
        {isUpdate ? 'Update Route' : 'Save New Route'}
      </h3>

      <div>
        <label className='mb-1 block text-xs font-medium text-gray-600' htmlFor={nameInputId}>
          Route name *
        </label>
        <input
          id={nameInputId}
          type='text'
          value={name}
          placeholder='e.g. Morning Commute'
          onBlur={() => validateName(name)}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) validateName(e.target.value);
          }}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-brand-dark
            focus:outline-none focus:ring-2 focus:ring-brand-orange/30
            ${nameError ? 'border-brand-red' : 'border-gray-200 focus:border-brand-orange'}`}
        />
        {nameError && (
          <p className='mt-1 text-xs text-brand-red'>{nameError}</p>
        )}
        {apiError && (
          <p className='mt-1 text-xs text-brand-red'>{apiError}</p>
        )}
      </div>

      <SegmentedVisibilityToggle
        isPublic={isPublic}
        onChange={setIsPublic}
        idPrefix={visibilityIdPrefix}
        className='ms-auto w-[min(100%,10.5rem)]'
        labelClassName={labelClassName}
      />

      <RoutePathCard startLabel={startLabel} endLabel={endLabel} />

      {liveStats && (
        <RouteMetricsPill
          distanceMeters={liveStats.distance}
          estimatedTimeMinutes={liveStats.estimatedTime}
        />
      )}

      <div className='flex flex-col gap-2 sm:flex-row sm:gap-3'>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={isDisabled}
          className='flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity
            bg-brand-orange text-white
            disabled:cursor-not-allowed disabled:opacity-40 hover:brightness-110'
        >
          {saving ? 'Saving...' : 'Save Route'}
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-semibold
            text-brand-dark transition-colors hover:border-brand-orange hover:text-brand-orange'
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

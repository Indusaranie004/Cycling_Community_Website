import React, { useState } from 'react';

export default function NearbySearch({ onSearch }) {
  const [radius, setRadius] = useState(5000);
  const [radiusError, setRadiusError] = useState('');
  const [geoError, setGeoError] = useState('');
  const [loading, setLoading] = useState(false);

  // Frontend validation for radius
  const validateRadius = (val) => {
    const n = Number(val);
    if (!val || isNaN(n) || n <= 0) {
      setRadiusError('Radius must be a positive number.');
      return false;
    }
    setRadiusError('');
    return true;
  };

  const handleSearch = () => {
    if (!validateRadius(radius)) return;
    setGeoError('');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onSearch(lat, lng, Number(radius));
        setLoading(false);
      },
      () => {
        setGeoError('Location access denied. Please allow location permission.');
        setLoading(false);
      }
    );
  };

  const isSearchDisabled = loading || !!radiusError || !radius;

  return (
    <div className='absolute top-20 left-4 z-10
      bg-brand-dark/90 backdrop-blur-sm
      rounded-xl shadow-lg p-4 w-56'>
      <p className='text-brand-sage text-xs font-semibold mb-3 uppercase tracking-wide'>
        Nearby Search
      </p>
      {/* Radius input */}
      <label className='block text-brand-cream text-xs mb-1'>
        Search radius (metres)
      </label>
      <input
        type='number'
        value={radius}
        min={1}
        onChange={e => { setRadius(e.target.value); validateRadius(e.target.value); }}
        className={`w-full rounded px-3 py-1.5 text-sm bg-white/10 text-brand-cream
          border focus:outline-none
          ${radiusError ? 'border-brand-red' : 'border-white/20 focus:border-brand-sage'}`}
      />
      {radiusError && (
        <p className='text-brand-red text-xs mt-1'>{radiusError}</p>
      )}
      {geoError && (
        <p className='text-brand-orange text-xs mt-2'>{geoError}</p>
      )}
      <button
        onClick={handleSearch}
        disabled={isSearchDisabled}
        className='mt-3 w-full py-2 rounded-lg text-sm font-semibold
          bg-brand-orange text-white transition-opacity
          disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110'
      >
        {loading ? 'Locating...' : 'Use My Location'}
      </button>
    </div>
  );
}
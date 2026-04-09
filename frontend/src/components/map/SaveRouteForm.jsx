import React, { useState } from 'react';

const MAX_NAME = 100;

export default function SaveRouteForm({ waypoints, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [nameError, setNameError] = useState('');
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  // Frontend validation
  const validateName = (val) => {
    if (!val.trim()) {
      setNameError('Route name is required.');
      return false;
    }
    if (val.length > MAX_NAME) {
      setNameError(`Name cannot exceed ${MAX_NAME} characters.`);
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
      // Inline API error (e.g. 409 duplicate name)
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = saving || !!nameError || !name.trim() || waypoints.length < 2;

  return (
    <div className='absolute bottom-0 left-0 right-0 z-10
      bg-brand-dark/95 backdrop-blur-sm
      p-4 flex flex-col gap-3'>
      <h3 className='text-brand-cream font-semibold text-sm'>Save New Route</h3>
      {/* Route name input */}
      <div>
        <div className='flex justify-between items-center mb-1'>
          <label className='text-brand-sage text-xs'>Route name *</label>
          <span className={`text-xs ${name.length > MAX_NAME
            ? 'text-brand-red' : 'text-gray-400'}`}>
            {name.length}/{MAX_NAME}
          </span>
        </div>
        <input
          type='text'
          value={name}
          maxLength={MAX_NAME + 10}
          placeholder='e.g. Morning Commute'
          onBlur={() => validateName(name)}
          onChange={e => { setName(e.target.value); validateName(e.target.value); }}
          className={`w-full rounded px-3 py-2 text-sm bg-white/10 text-brand-cream
            border focus:outline-none
            ${nameError ? 'border-brand-red' : 'border-white/20 focus:border-brand-sage'}`}
        />
        {nameError && (
          <p className='text-brand-red text-xs mt-1'>{nameError}</p>
        )}
        {apiError && (
          <p className='text-brand-red text-xs mt-1'>{apiError}</p>
        )}
      </div>
      {/* Visibility toggle */}
      <div className='flex items-center gap-3'>
        {['Public', 'Private'].map(opt => (
          <button
            key={opt}
            onClick={() => setIsPublic(opt === 'Public')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
              ${(opt === 'Public') === isPublic
                ? 'bg-brand-sage text-brand-dark'
                : 'bg-white/10 text-brand-cream'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {/* Actions */}
      <div className='flex gap-3'>
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className='flex-1 py-2 rounded-lg text-sm font-semibold transition-opacity
            bg-brand-orange text-white
            disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90'
        >
          {saving ? 'Saving...' : 'Save Route'}
        </button>
        <button
          onClick={onCancel}
          className='px-5 py-2 rounded-lg text-sm font-semibold
            bg-white/10 text-brand-cream hover:bg-white/20 transition-colors'
        >
          Cancel
        </button>
      </div>
    </div>
  );
}